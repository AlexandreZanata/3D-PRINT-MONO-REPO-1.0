// @max-lines 200 — this is enforced by the lint pipeline.
import { Product, PriceVO, WhatsAppNumberVO } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { describe, expect, it, vi } from "vitest";
import { ListProductsUseCase } from "./ListProductsUseCase.js";

const makeProduct = () =>
  Product.create({
    id: "prod-1",
    name: "Vase",
    description: "A vase",
    price: 49.99,
    stock: 10,
    whatsappNumber: "+5511999999999",
  });

const mockRepo = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
};

describe("ListProductsUseCase", () => {
  it("should return paginated products on success", async () => {
    const product = makeProduct();
    mockRepo.findAll.mockResolvedValue(
      ok({ items: [product], total: 1, page: 1, limit: 20 }),
    );

    const useCase = new ListProductsUseCase(mockRepo);
    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0]?.name).toBe("Vase");
      expect(result.value.total).toBe(1);
    }
  });

  it("should return empty list when no products match filters", async () => {
    mockRepo.findAll.mockResolvedValue(
      ok({ items: [], total: 0, page: 1, limit: 20 }),
    );

    const useCase = new ListProductsUseCase(mockRepo);
    const result = await useCase.execute({ page: 1, limit: 20, name: "nonexistent" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.items).toHaveLength(0);
      expect(result.value.total).toBe(0);
    }
  });

  it("should propagate InfraError from repository", async () => {
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"));
    mockRepo.findAll.mockResolvedValue(err(infraErr));

    const useCase = new ListProductsUseCase(mockRepo);
    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
