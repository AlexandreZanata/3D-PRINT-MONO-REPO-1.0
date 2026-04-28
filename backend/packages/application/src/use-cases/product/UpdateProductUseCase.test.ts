// @max-lines 200 — this is enforced by the lint pipeline.
import { Product } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { describe, expect, it, vi } from "vitest";
import { UpdateProductUseCase } from "./UpdateProductUseCase.js";

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
  update: vi.fn().mockResolvedValue(ok(undefined)),
  softDelete: vi.fn(),
};

describe("UpdateProductUseCase", () => {
  it("should return updated product DTO on valid input", async () => {
    mockRepo.findById.mockResolvedValue(ok(makeProduct()));
    const useCase = new UpdateProductUseCase(mockRepo);

    const result = await useCase.execute("prod-1", { name: "Updated Vase", price: 59.99 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Updated Vase");
      expect(result.value.price).toBe(59.99);
    }
  });

  it("should preserve unchanged fields when only some fields are updated", async () => {
    mockRepo.findById.mockResolvedValue(ok(makeProduct()));
    const useCase = new UpdateProductUseCase(mockRepo);

    const result = await useCase.execute("prod-1", { name: "New Name" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("New Name");
      expect(result.value.price).toBe(49.99);
      expect(result.value.stock).toBe(10);
    }
  });

  it("should return NotFoundError when product does not exist", async () => {
    mockRepo.findById.mockResolvedValue(ok(null));
    const useCase = new UpdateProductUseCase(mockRepo);

    const result = await useCase.execute("missing-id", { name: "X" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("not found");
    }
  });

  it("should return DomainError when updated price is negative", async () => {
    mockRepo.findById.mockResolvedValue(ok(makeProduct()));
    const useCase = new UpdateProductUseCase(mockRepo);

    const result = await useCase.execute("prod-1", { price: -5 });

    expect(result.ok).toBe(false);
  });

  it("should propagate InfraError from repository findById", async () => {
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"), "DB_ERROR");
    mockRepo.findById.mockResolvedValue(err(infraErr));
    const useCase = new UpdateProductUseCase(mockRepo);

    const result = await useCase.execute("prod-1", { name: "X" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });

  it("should propagate InfraError from repository update", async () => {
    mockRepo.findById.mockResolvedValue(ok(makeProduct()));
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"), "DB_ERROR");
    mockRepo.update.mockResolvedValue(err(infraErr));
    const useCase = new UpdateProductUseCase(mockRepo);

    const result = await useCase.execute("prod-1", { name: "X" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
