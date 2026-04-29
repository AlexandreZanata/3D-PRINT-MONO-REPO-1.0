import type { ProductDTO, ProductFacade } from "@repo/application";
import type { QueuePublisher } from "@repo/domain";
import type { SSEManager } from "@repo/sse-adapter";
import type { AppLogger } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { InfraError, NotFoundError } from "@repo/utils";
// @max-lines 200 — this is enforced by the lint pipeline.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventingProductFacade } from "./EventingProductFacade.js";

const ROUTING_KEYS = {
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",
} as const;

function makeDto(overrides: Partial<ProductDTO> = {}): ProductDTO {
  return {
    id: "prod-1",
    name: "Vase",
    slug: "vase",
    tagline: "",
    category: "Decor",
    material: "",
    dimensions: "",
    description: "A vase",
    price: 49.99,
    stock: 10,
    whatsappNumber: "+5511999999999",
    imageUrl: null,
    images: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

function makeFacade(): ProductFacade {
  return {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(ok(makeDto())),
    create: vi.fn().mockResolvedValue(ok(makeDto())),
    update: vi.fn().mockResolvedValue(ok(makeDto())),
    delete: vi.fn().mockResolvedValue(ok(undefined)),
    whatsAppLink: vi.fn(),
  } as unknown as ProductFacade;
}

function makePublisher(): QueuePublisher {
  return { publish: vi.fn().mockResolvedValue(ok(undefined)) };
}

function makeSseManager(): SSEManager {
  return { broadcast: vi.fn() } as unknown as SSEManager;
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

describe("EventingProductFacade", () => {
  let inner: ReturnType<typeof makeFacade>;
  let publisher: ReturnType<typeof makePublisher>;
  let sseManager: ReturnType<typeof makeSseManager>;
  let facade: EventingProductFacade;

  beforeEach(() => {
    inner = makeFacade();
    publisher = makePublisher();
    sseManager = makeSseManager();
    facade = new EventingProductFacade(inner, publisher, sseManager, ROUTING_KEYS, makeLogger());
  });

  describe("create", () => {
    it("should publish and broadcast after successful create", async () => {
      const result = await facade.create({
        name: "Vase",
        description: "d",
        price: 49.99,
        stock: 5,
        whatsappNumber: "+5511999999999",
      });

      expect(result.ok).toBe(true);
      expect(publisher.publish).toHaveBeenCalledWith(
        "product.created",
        expect.objectContaining({ eventType: "product.created" }),
      );
      expect(sseManager.broadcast).toHaveBeenCalledWith(
        "product.created",
        expect.objectContaining({ productId: "prod-1" }),
      );
    });

    it("should not publish when create fails", async () => {
      vi.mocked(inner.create).mockResolvedValue(err(new Error("DB error")));
      const result = await facade.create({
        name: "Vase",
        description: "d",
        price: 49.99,
        stock: 5,
        whatsappNumber: "+5511999999999",
      });

      expect(result.ok).toBe(false);
      expect(publisher.publish).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should publish and broadcast after successful delete", async () => {
      const result = await facade.delete("prod-1");

      expect(result.ok).toBe(true);
      expect(publisher.publish).toHaveBeenCalledWith(
        "product.deleted",
        expect.objectContaining({ eventType: "product.deleted" }),
      );
      expect(sseManager.broadcast).toHaveBeenCalledWith(
        "product.deleted",
        expect.objectContaining({ productId: "prod-1" }),
      );
    });

    it("should warn but not fail when publisher returns error", async () => {
      vi.mocked(publisher.publish).mockResolvedValue(
        err(new InfraError("Queue down", new Error("conn"), "RABBITMQ_ERROR")),
      );
      const result = await facade.delete("prod-1");
      expect(result.ok).toBe(true); // Main operation succeeded
    });

    it("should not publish when delete fails", async () => {
      vi.mocked(inner.delete).mockResolvedValue(
        err(new NotFoundError("Not found", "PRODUCT_NOT_FOUND")),
      );
      const result = await facade.delete("prod-missing");

      expect(result.ok).toBe(false);
      expect(publisher.publish).not.toHaveBeenCalled();
    });
  });
});
