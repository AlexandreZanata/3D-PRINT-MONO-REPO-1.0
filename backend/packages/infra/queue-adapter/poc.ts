// @max-lines 200 — this is enforced by the lint pipeline.
// poc.ts — minimum working usage of @repo/queue-adapter
// Run: npx tsx poc.ts (requires RabbitMQ running on localhost:5672)

import { ok } from "@repo/utils";
import { QUEUES, ROUTING_KEYS, RabbitMQConsumer, RabbitMQPublisher } from "./src/index.js";

async function main() {
  const config = {
    url: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
  };

  // ── Publisher ─────────────────────────────────────────────────────────────
  const publisher = new RabbitMQPublisher(config);
  const connectResult = await publisher.connect();
  if (!connectResult.ok) throw connectResult.error;

  const message = {
    eventId: crypto.randomUUID(),
    eventType: "product.created",
    occurredAt: new Date().toISOString(),
    payload: { productId: "prod-123", name: "Geometric Vase", price: 49.99 },
  };

  const publishResult = await publisher.publish(ROUTING_KEYS.PRODUCT_CREATED, message);
  if (!publishResult.ok) throw publishResult.error;

  // ── Consumer ──────────────────────────────────────────────────────────────
  const consumer = new RabbitMQConsumer(config);
  const consumerConnectResult = await consumer.connect();
  if (!consumerConnectResult.ok) throw consumerConnectResult.error;

  const subscribeResult = await consumer.subscribe(QUEUES.PRODUCT_CREATED, async (_msg) => {
    return ok(undefined); // Success
  });

  if (!subscribeResult.ok) throw subscribeResult.error;

  // Keep alive for 5 seconds to receive messages
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await publisher.close();
  await consumer.close();
}

main().catch((e) => {
  console.error("POC failed:", e);
  process.exit(1);
});
