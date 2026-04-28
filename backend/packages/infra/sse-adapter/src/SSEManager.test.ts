// @max-lines 200 — this is enforced by the lint pipeline.
import { createLogger } from "@repo/utils";
import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { SSEManager } from "./SSEManager.js";

// Mock writable stream
class MockWritableStream extends EventEmitter {
  written: string[] = [];

  write(chunk: string): boolean {
    this.written.push(chunk);
    return true;
  }

  end(): void {
    this.emit("close");
  }
}

describe("SSEManager", () => {
  const logger = createLogger("test");
  const config = { maxConnections: 2, heartbeatIntervalMs: 100 };

  it("should add a connection successfully", () => {
    const manager = new SSEManager(config, logger);
    const response = new MockWritableStream();

    const added = manager.addConnection("conn-1", response as never);
    expect(added).toBe(true);
    expect(manager.connectionCount()).toBe(1);

    manager.close();
  });

  it("should reject connection when max limit is reached", () => {
    const manager = new SSEManager(config, logger);
    const response1 = new MockWritableStream();
    const response2 = new MockWritableStream();
    const response3 = new MockWritableStream();

    manager.addConnection("conn-1", response1 as never);
    manager.addConnection("conn-2", response2 as never);
    const added = manager.addConnection("conn-3", response3 as never);

    expect(added).toBe(false);
    expect(manager.connectionCount()).toBe(2);

    manager.close();
  });

  it("should remove connection on close event", () => {
    const manager = new SSEManager(config, logger);
    const response = new MockWritableStream();

    manager.addConnection("conn-1", response as never);
    expect(manager.connectionCount()).toBe(1);

    response.emit("close");
    expect(manager.connectionCount()).toBe(0);

    manager.close();
  });

  it("should broadcast event to all connections", () => {
    const manager = new SSEManager(config, logger);
    const response1 = new MockWritableStream();
    const response2 = new MockWritableStream();

    manager.addConnection("conn-1", response1 as never);
    manager.addConnection("conn-2", response2 as never);

    manager.broadcast("product.created", {
      productId: "prod-123",
      name: "Vase",
      price: 49.99,
      eventId: "evt-456",
      occurredAt: new Date().toISOString(),
    });

    // Both connections should receive the event
    expect(response1.written.some((chunk) => chunk.includes("product.created"))).toBe(true);
    expect(response2.written.some((chunk) => chunk.includes("product.created"))).toBe(true);

    manager.close();
  });

  it("should send heartbeat to all connections", async () => {
    const manager = new SSEManager({ maxConnections: 10, heartbeatIntervalMs: 50 }, logger);
    const response = new MockWritableStream();

    manager.addConnection("conn-1", response as never);

    // Wait for heartbeat
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(response.written.some((chunk) => chunk.includes("heartbeat"))).toBe(true);

    manager.close();
  });
});
