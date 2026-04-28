// @max-lines 200 — this is enforced by the lint pipeline.
import { IoRedisClient } from "@repo/cache-adapter";
import { QUEUES, RabbitMQConsumer } from "@repo/queue-adapter";
import { createLogger } from "@repo/utils";
import { ProductEventConsumer } from "./consumers/ProductEventConsumer.js";
import { WhatsAppLinkService } from "./services/WhatsAppLinkService.js";

export interface CompositionRoot {
  readonly close: () => Promise<void>;
}

export async function buildCompositionRoot(): Promise<CompositionRoot> {
  const logger = createLogger("notification-service");

  // ── Redis ─────────────────────────────────────────────────────────────────
  const redisPassword = process.env.REDIS_PASSWORD;
  const redis = new IoRedisClient({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    ...(redisPassword !== undefined ? { password: redisPassword } : {}),
  });

  // ── RabbitMQ ──────────────────────────────────────────────────────────────
  const rabbitUrl =
    process.env.RABBITMQ_URL ??
    `amqp://${process.env.RABBITMQ_USER ?? "guest"}:${process.env.RABBITMQ_PASSWORD ?? "guest"}@${process.env.RABBITMQ_HOST ?? "localhost"}:${process.env.RABBITMQ_PORT ?? 5672}`;

  const consumer = new RabbitMQConsumer({ url: rabbitUrl });
  const connectResult = await consumer.connect();
  if (!connectResult.ok) {
    throw new Error(`RabbitMQ connection failed: ${connectResult.error.message}`);
  }

  // ── Services ──────────────────────────────────────────────────────────────
  const whatsAppService = new WhatsAppLinkService(redis, logger);
  const eventConsumer = new ProductEventConsumer(whatsAppService, logger);

  // ── Subscribe to queues ───────────────────────────────────────────────────
  const [r1, r2, r3] = await Promise.all([
    consumer.subscribe(QUEUES.PRODUCT_CREATED, eventConsumer.handleCreated),
    consumer.subscribe(QUEUES.PRODUCT_UPDATED, eventConsumer.handleUpdated),
    consumer.subscribe(QUEUES.PRODUCT_DELETED, eventConsumer.handleDeleted),
  ]);

  for (const r of [r1, r2, r3]) {
    if (!r.ok) throw new Error(`Queue subscription failed: ${r.error.message}`);
  }

  logger.info("notification-service subscribed to all product queues");

  return {
    close: async () => {
      await consumer.close();
      await redis.disconnect();
    },
  };
}
