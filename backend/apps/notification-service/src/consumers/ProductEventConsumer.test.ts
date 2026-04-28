import type { QueueMessage } from "@repo/domain";
import type { AppLogger } from "@repo/utils";
// @max-lines 200 — this is enforced by the lint pipeline.
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WhatsAppLinkService } from "../services/WhatsAppLinkService.js";
import { ProductEventConsumer } from "./ProductEventConsumer.js";

function makeWhatsAppService(): WhatsAppLinkService {
  return {
    buildAndCache: vi.fn().mockResolvedValue("https://wa.me/test"),
    getCached: vi.fn(),
  } as unknown as WhatsAppLinkService;
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

function makeMsg(payload: Record<string, unknown>): QueueMessage {
  return {
    eventId: "evt-1",
    eventType: "product.created",
    occurredAt: new Date().toISOString(),
    payload,
  };
}

describe("ProductEventConsumer", () => {
  let whatsApp: ReturnType<typeof makeWhatsAppService>;
  let logger: AppLogger;
  let consumer: ProductEventConsumer;

  beforeEach(() => {
    whatsApp = makeWhatsAppService();
    logger = makeLogger();
    consumer = new ProductEventConsumer(whatsApp, logger);
    process.env.DEFAULT_WHATSAPP_NUMBER = "+5511999999999";
  });

  describe("handleCreated", () => {
    it("should build and cache a WhatsApp link for a valid product payload", async () => {
      const msg = makeMsg({
        productId: "p1",
        name: "Vase",
        price: 49.99,
        whatsappNumber: "+5511111111111",
      });
      const result = await consumer.handleCreated(msg);

      expect(result.ok).toBe(true);
      expect(whatsApp.buildAndCache).toHaveBeenCalledWith(
        "+5511111111111",
        expect.objectContaining({ productId: "p1" }),
      );
    });

    it("should use DEFAULT_WHATSAPP_NUMBER when payload has no whatsappNumber", async () => {
      const msg = makeMsg({ productId: "p2", name: "Bowl", price: 30 });
      const result = await consumer.handleCreated(msg);

      expect(result.ok).toBe(true);
      expect(whatsApp.buildAndCache).toHaveBeenCalledWith("+5511999999999", expect.anything());
    });

    it("should ack (ok) malformed payloads without calling buildAndCache", async () => {
      const msg = makeMsg({ bad: "data" });
      const result = await consumer.handleCreated(msg);

      expect(result.ok).toBe(true);
      expect(whatsApp.buildAndCache).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return InfraError when buildAndCache throws", async () => {
      vi.mocked(whatsApp.buildAndCache).mockRejectedValue(new Error("Redis down"));
      const msg = makeMsg({ productId: "p3", name: "Lamp", price: 80 });
      const result = await consumer.handleCreated(msg);

      expect(result.ok).toBe(false);
    });
  });

  describe("handleDeleted", () => {
    it("should ack deleted events and log the productId", async () => {
      const msg = makeMsg({ productId: "p-del" });
      const result = await consumer.handleDeleted(msg);

      expect(result.ok).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ productId: "p-del" }),
        expect.any(String),
      );
    });

    it("should ack deleted events even when productId is missing", async () => {
      const msg = makeMsg({});
      const result = await consumer.handleDeleted(msg);
      expect(result.ok).toBe(true);
    });
  });
});
