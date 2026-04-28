import type { RedisClient } from "@repo/domain";
import type { AppLogger } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { InfraError } from "@repo/utils";
// @max-lines 200 — this is enforced by the lint pipeline.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WhatsAppLinkService } from "./WhatsAppLinkService.js";

function makeRedis(): RedisClient {
  return {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue(ok(undefined)),
    del: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    smembers: vi.fn(),
    expire: vi.fn(),
    hset: vi.fn(),
    hget: vi.fn(),
    zadd: vi.fn(),
    zrem: vi.fn(),
    zcard: vi.fn(),
  };
}

function makeLogger(): AppLogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    trace: vi.fn(),
    child: vi.fn(),
  } as unknown as AppLogger;
}

describe("WhatsAppLinkService", () => {
  let redis: ReturnType<typeof makeRedis>;
  let logger: AppLogger;
  let service: WhatsAppLinkService;

  beforeEach(() => {
    redis = makeRedis();
    logger = makeLogger();
    service = new WhatsAppLinkService(redis, logger);
  });

  describe("buildAndCache", () => {
    it("should build a valid wa.me URL and cache it", async () => {
      const url = await service.buildAndCache("+5511999999999", {
        productId: "prod-1",
        name: "Geometric Vase",
        price: 49.99,
      });

      expect(url).toMatch(/^https:\/\/wa\.me\/\+5511999999999\?text=/);
      expect(url).toContain("Geometric%20Vase");
      expect(redis.set).toHaveBeenCalledWith("whatsapp:link:prod-1", url, 86400);
    });

    it("should include product name and price in the encoded text", async () => {
      const url = await service.buildAndCache("+5511000000000", {
        productId: "prod-2",
        name: "Chess Set",
        price: 120.0,
      });

      const decoded = decodeURIComponent(url.split("?text=")[1] ?? "");
      expect(decoded).toContain("Chess Set");
      expect(decoded).toContain("120.00");
    });

    it("should log a warning but still return the URL when Redis set fails", async () => {
      vi.mocked(redis.set).mockResolvedValue(
        err(new InfraError("Redis down", new Error("conn"), "REDIS_ERROR")),
      );

      const url = await service.buildAndCache("+5511999999999", {
        productId: "prod-3",
        name: "Vase",
        price: 10,
      });

      expect(url).toMatch(/^https:\/\/wa\.me\//);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("getCached", () => {
    it("should return the cached URL when present", async () => {
      vi.mocked(redis.get).mockResolvedValue(ok("https://wa.me/test"));

      const result = await service.getCached("prod-1");
      expect(result).toBe("https://wa.me/test");
    });

    it("should return null when key is not in cache", async () => {
      vi.mocked(redis.get).mockResolvedValue(ok(null));

      const result = await service.getCached("prod-missing");
      expect(result).toBeNull();
    });

    it("should return null when Redis get fails", async () => {
      vi.mocked(redis.get).mockResolvedValue(
        err(new InfraError("Redis error", new Error("conn"), "REDIS_ERROR")),
      );

      const result = await service.getCached("prod-err");
      expect(result).toBeNull();
    });
  });
});
