// @max-lines 200 — this is enforced by the lint pipeline.
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateProductUseCase } from "./CreateProductUseCase.js";

const mockRepo = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn().mockResolvedValue(ok(undefined)),
  update: vi.fn(),
  softDelete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRepo.save.mockResolvedValue(ok(undefined));
});

const makeDeps = () => ({
  productRepo: mockRepo,
  generateId: vi.fn().mockReturnValue("prod-new"),
});

const validInput = {
  name: "Geometric Vase",
  description: "A modern 3D-printed vase",
  price: 49.99,
  stock: 10,
  whatsappNumber: "+5511999999999",
};

describe("CreateProductUseCase", () => {
  it("should return product DTO on valid input", async () => {
    const deps = makeDeps();
    const useCase = new CreateProductUseCase(deps);
    const result = await useCase.execute(validInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("prod-new");
      expect(result.value.name).toBe("Geometric Vase");
      expect(result.value.price).toBe(49.99);
      expect(result.value.isActive).toBe(true);
    }
  });

  it("should persist the product via the repository", async () => {
    const deps = makeDeps();
    const useCase = new CreateProductUseCase(deps);
    await useCase.execute(validInput);

    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it("should return DomainError when price is negative", async () => {
    const deps = makeDeps();
    const useCase = new CreateProductUseCase(deps);
    const result = await useCase.execute({ ...validInput, price: -1 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBeTruthy();
    }
  });

  it("should return DomainError when whatsapp number is invalid", async () => {
    const deps = makeDeps();
    const useCase = new CreateProductUseCase(deps);
    const result = await useCase.execute({ ...validInput, whatsappNumber: "not-a-number" });

    expect(result.ok).toBe(false);
  });

  it("should propagate InfraError when repository save fails", async () => {
    const deps = makeDeps();
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"), "DB_ERROR");
    deps.productRepo.save.mockResolvedValue(err(infraErr));

    const useCase = new CreateProductUseCase(deps);
    const result = await useCase.execute(validInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
