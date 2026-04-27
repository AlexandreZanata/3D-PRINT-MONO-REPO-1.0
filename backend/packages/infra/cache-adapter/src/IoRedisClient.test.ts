// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it, vi } from "vitest";
import { IoRedisClient } from "./IoRedisClient.js";

// Mock ioredis
vi.mock("ioredis", () => {
  return {
    Redis: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue("value"),
      set: vi.fn().mockResolvedValue("OK"),
      setex: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
      sadd: vi.fn().mockResolvedValue(1),
      srem: vi.fn().mockResolvedValue(1),
      smembers: vi.fn().mockResolvedValue(["member1", "member2"]),
      expire: vi.fn().mockResolvedValue(1),
      hset: vi.fn().mockResolvedValue(1),
      hget: vi.fn().mockResolvedValue("field-value"),
      zadd: vi.fn().mockResolvedValue(1),
      zrem: vi.fn().mockResolvedValue(1),
      zcard: vi.fn().mockResolvedValue(5),
      quit: vi.fn().mockResolvedValue("OK"),
    })),
  };
});

describe("IoRedisClient", () => {
  it("should get a value successfully", async () => {
    const client = new IoRedisClient({ host: "localhost", port: 6379 });
    const result = await client.get("test:key");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("value");
    }
  });

  it("should set a value with TTL", async () => {
    const client = new IoRedisClient({ host: "localhost", port: 6379 });
    const result = await client.set("test:key", "value", 300);
    expect(result.ok).toBe(true);
  });

  it("should delete a key", async () => {
    const client = new IoRedisClient({ host: "localhost", port: 6379 });
    const result = await client.del("test:key");
    expect(result.ok).toBe(true);
  });

  it("should add members to a set", async () => {
    const client = new IoRedisClient({ host: "localhost", port: 6379 });
    const result = await client.sadd("test:set", "member1", "member2");
    expect(result.ok).toBe(true);
  });

  it("should get set members", async () => {
    const client = new IoRedisClient({ host: "localhost", port: 6379 });
    const result = await client.smembers("test:set");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(["member1", "member2"]);
    }
  });

  it("should handle zadd and zcard operations", async () => {
    const client = new IoRedisClient({ host: "localhost", port: 6379 });
    const addResult = await client.zadd("test:zset", 1, "member");
    expect(addResult.ok).toBe(true);

    const countResult = await client.zcard("test:zset");
    expect(countResult.ok).toBe(true);
    if (countResult.ok) {
      expect(countResult.value).toBe(5);
    }
  });
});
