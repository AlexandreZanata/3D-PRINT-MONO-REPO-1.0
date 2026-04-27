// @max-lines 200 — this is enforced by the lint pipeline.
import type { MessageHandler, QueueConsumer, QueueMessage } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { Channel, Connection, ConsumeMessage } from "amqplib";
import { connect } from "amqplib";
import { setupTopology } from "./topology.js";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Base delay for exponential backoff

export interface RabbitMQConfig {
  readonly url: string;
}

export class RabbitMQConsumer implements QueueConsumer {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  constructor(private readonly config: RabbitMQConfig) {}

  async connect(): Promise<Result<void, InfraError>> {
    try {
      this.connection = await connect(this.config.url);
      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(1); // Process one message at a time
      await setupTopology(this.channel);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("RabbitMQ connection failed", toError(e), "RABBITMQ_ERROR"));
    }
  }

  async subscribe(queue: string, handler: MessageHandler): Promise<Result<void, InfraError>> {
    if (!this.channel) {
      return err(new InfraError("Channel not initialized", new Error("Call connect() first"), "RABBITMQ_ERROR"));
    }

    try {
      await this.channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;
          await this.handleMessage(msg, handler);
        },
        { noAck: false }, // Manual acknowledgment
      );
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Subscribe failed for queue ${queue}`, toError(e), "RABBITMQ_ERROR"));
    }
  }

  private async handleMessage(msg: ConsumeMessage, handler: MessageHandler): Promise<void> {
    if (!this.channel) return;

    try {
      const message: QueueMessage = JSON.parse(msg.content.toString());
      const retryCount = this.getRetryCount(msg);

      const result = await handler(message);

      if (result.ok) {
        // Success — acknowledge
        this.channel.ack(msg);
      } else {
        // Failure — retry or send to DLQ
        if (retryCount < MAX_RETRIES) {
          await this.retryMessage(msg, retryCount + 1);
        } else {
          // Max retries exceeded — NACK without requeue (goes to DLQ)
          this.channel.nack(msg, false, false);
        }
      }
    } catch (e) {
      // Parsing or unexpected error — NACK without requeue
      this.channel.nack(msg, false, false);
    }
  }

  private getRetryCount(msg: ConsumeMessage): number {
    const headers = msg.properties.headers ?? {};
    return Number(headers["x-retry-count"]) || 0;
  }

  private async retryMessage(msg: ConsumeMessage, retryCount: number): Promise<void> {
    if (!this.channel) return;

    const delay = RETRY_DELAY_MS * 2 ** (retryCount - 1); // Exponential backoff

    // Republish with updated retry count
    this.channel.publish(msg.fields.exchange, msg.fields.routingKey, msg.content, {
      ...msg.properties,
      headers: {
        ...msg.properties.headers,
        "x-retry-count": retryCount,
      },
      expiration: delay.toString(),
    });

    // Acknowledge original message
    this.channel.ack(msg);
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
