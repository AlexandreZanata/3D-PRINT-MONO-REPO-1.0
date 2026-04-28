// @max-lines 200 — this is enforced by the lint pipeline.
import type { QueueMessage, QueuePublisher } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { Channel, Connection } from "amqplib";
import { connect } from "amqplib";
import { EXCHANGE_NAME, setupTopology } from "./topology.js";

export interface RabbitMQConfig {
  readonly url: string;
}

export class RabbitMQPublisher implements QueuePublisher {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  constructor(private readonly config: RabbitMQConfig) {}

  async connect(): Promise<Result<void, InfraError>> {
    try {
      this.connection = await connect(this.config.url);
      this.channel = await this.connection.createChannel();
      await setupTopology(this.channel);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("RabbitMQ connection failed", toError(e), "RABBITMQ_ERROR"));
    }
  }

  async publish(routingKey: string, message: QueueMessage): Promise<Result<void, InfraError>> {
    if (!this.channel) {
      return err(
        new InfraError(
          "Channel not initialized",
          new Error("Call connect() first"),
          "RABBITMQ_ERROR",
        ),
      );
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));
      const published = this.channel.publish(EXCHANGE_NAME, routingKey, buffer, {
        persistent: true,
        contentType: "application/json",
        messageId: message.eventId,
        timestamp: Date.now(),
      });

      if (!published) {
        return err(
          new InfraError(
            "Publish failed (buffer full)",
            new Error("Channel buffer full"),
            "RABBITMQ_ERROR",
          ),
        );
      }

      return ok(undefined);
    } catch (e) {
      return err(
        new InfraError(
          `Publish failed for routing key ${routingKey}`,
          toError(e),
          "RABBITMQ_ERROR",
        ),
      );
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
