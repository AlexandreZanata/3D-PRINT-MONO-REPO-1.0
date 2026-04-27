// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it, vi } from "vitest";
import { RabbitMQPublisher } from "./RabbitMQPublisher.js";

// Mock amqplib
vi.mock("amqplib", () => ({
  connect: vi.fn().mockResolvedValue({
    createChannel: vi.fn().mockResolvedValue({
      assertExchange: vi.fn().mockResolvedValue({}),
      assertQueue: vi.fn().mockResolvedValue({}),
      bindQueue: vi.fn().mockResolvedValue({}),
      publish: vi.fn().mockReturnValue(true),
      close: vi.fn().mockResolvedValue(undefined),
    }),
    close: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("RabbitMQPublisher", () => {
  it("should connect successfully", async () => {
    const publisher = new RabbitMQPublisher({ url: "amqp://localhost" });
    const result = await publisher.connect();
    expect(result.ok).toBe(true);
  });

  it("should publish a message successfully", async () => {
    const publisher = new RabbitMQPublisher({ url: "amqp://localhost" });
    await publisher.connect();

    const message = {
      eventId: "evt-123",
      eventType: "product.created",
      occurredAt: new Date().toISOString(),
      payload: { productId: "prod-456", name: "Vase" },
    };

    const result = await publisher.publish("product.created", message);
    expect(result.ok).toBe(true);
  });

  it("should return error when publishing without connection", async () => {
    const publisher = new RabbitMQPublisher({ url: "amqp://localhost" });
    const message = {
      eventId: "evt-123",
      eventType: "product.created",
      occurredAt: new Date().toISOString(),
      payload: {},
    };

    const result = await publisher.publish("product.created", message);
    expect(result.ok).toBe(false);
  });
});
