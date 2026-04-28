// @max-lines 200 — this is enforced by the lint pipeline.
import { Product } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { describe, expect, it, vi } from "vitest";
import { GetProductByIdUseCase } from "./GetProductByIdUseCase.js";

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

describe("GetProductByIdUseCase", () => {
  it("should return product DTO when found", async () => {
    mockRepo.findById.mockResolvedValue(ok(makeProduct()));

    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute("prod-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("prod-1");
      expect(result.value.name).toBe("Vase");
      expect(result.value.price).toBe(49.99);
    }
  });

  it("should return NotFoundError when product does not exist", async () => {
    mockRepo.findById.mockResolvedValue(ok(null));

    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute("missing-id");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("not found");
    }
  });

  it("should propagate InfraError from repository", async () => {
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"));
    mockRepo.findById.mockResolvedValue(err(infraErr));

    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute("prod-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
