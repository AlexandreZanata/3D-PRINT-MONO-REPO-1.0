// @max-lines 200 — this is enforced by the lint pipeline.
import type { Channel } from "amqplib";

export const EXCHANGE_NAME = "product.events";
export const DLX_NAME = "product.events.dlx";
export const DLQ_NAME = "product.events.dlq";

export const ROUTING_KEYS = {
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",
} as const;

export const QUEUES = {
  PRODUCT_CREATED: "product.created.queue",
  PRODUCT_UPDATED: "product.updated.queue",
  PRODUCT_DELETED: "product.deleted.queue",
} as const;

/**
 * Sets up the RabbitMQ exchange topology:
 * - Main topic exchange for product events
 * - Dead-letter exchange and queue for failed messages
 * - Bindings for each routing key
 */
export async function setupTopology(channel: Channel): Promise<void> {
  // Declare dead-letter exchange and queue first
  await channel.assertExchange(DLX_NAME, "topic", { durable: true });
  await channel.assertQueue(DLQ_NAME, { durable: true });
  await channel.bindQueue(DLQ_NAME, DLX_NAME, "#");

  // Declare main exchange
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

  // Declare and bind queues with DLX configuration
  const queueOptions = {
    durable: true,
    deadLetterExchange: DLX_NAME,
  };

  await channel.assertQueue(QUEUES.PRODUCT_CREATED, queueOptions);
  await channel.bindQueue(QUEUES.PRODUCT_CREATED, EXCHANGE_NAME, ROUTING_KEYS.PRODUCT_CREATED);

  await channel.assertQueue(QUEUES.PRODUCT_UPDATED, queueOptions);
  await channel.bindQueue(QUEUES.PRODUCT_UPDATED, EXCHANGE_NAME, ROUTING_KEYS.PRODUCT_UPDATED);

  await channel.assertQueue(QUEUES.PRODUCT_DELETED, queueOptions);
  await channel.bindQueue(QUEUES.PRODUCT_DELETED, EXCHANGE_NAME, ROUTING_KEYS.PRODUCT_DELETED);
}
