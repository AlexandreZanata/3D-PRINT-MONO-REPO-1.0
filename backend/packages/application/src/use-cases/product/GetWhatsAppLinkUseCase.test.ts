// @max-lines 200 — this is enforced by the lint pipeline.
import { Product } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { describe, expect, it, vi } from "vitest";
import { GetWhatsAppLinkUseCase } from "./GetWhatsAppLinkUseCase.js";

const makeProduct = (whatsappNumber = "+5511999999999") =>
  Product.create({
    id: "prod-1",
    name: "Geometric Vase",
    description: "A vase",
    price: 49.99,
    stock: 10,
    whatsappNumber,
  });

const mockRepo = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
};

describe("GetWhatsAppLinkUseCase", () => {
  it("should return a valid wa.me URL for an existing product", async () => {
    mockRepo.findById.mockResolvedValue(ok(makeProduct()));
    const useCase = new GetWhatsAppLinkUseCase(mockRepo);

    const result = await useCase.execute("prod-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.url).toMatch(/^https:\/\/wa\.me\//);
      expect(result.value.url).toContain("5511999999999");
    }
  });

  it("should encode the product name and price in the URL text param", async () => {
    mockRepo.findById.mockResolvedValue(ok(makeProduct()));
    const useCase = new GetWhatsAppLinkUseCase(mockRepo);

    const result = await useCase.execute("prod-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const decoded = decodeURIComponent(result.value.url.split("?text=")[1] ?? "");
      expect(decoded).toContain("Geometric Vase");
    }
  });

  it("should return NotFoundError when product does not exist", async () => {
    mockRepo.findById.mockResolvedValue(ok(null));
    const useCase = new GetWhatsAppLinkUseCase(mockRepo);

    const result = await useCase.execute("missing-id");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("not found");
    }
  });

  it("should propagate InfraError from repository", async () => {
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"), "DB_ERROR");
    mockRepo.findById.mockResolvedValue(err(infraErr));
    const useCase = new GetWhatsAppLinkUseCase(mockRepo);

    const result = await useCase.execute("prod-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
