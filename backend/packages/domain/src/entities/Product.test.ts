// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { Product } from "./Product.js";

const validInput = {
  id: "01900000-0000-7000-8000-000000000001",
  name: "  Vase  ",
  description: "A beautiful vase",
  price: 49.99,
  stock: 10,
  whatsappNumber: "+5511999999999",
};

describe("Product.create()", () => {
  it("should create a product with trimmed name and isActive=true", () => {
    const p = Product.create(validInput);
    expect(p.name).toBe("Vase");
    expect(p.isActive).toBe(true);
    expect(p.deletedAt).toBeNull();
    expect(p.price.value).toBe(49.99);
  });

  it("should default imageUrl to null when not provided", () => {
    const p = Product.create(validInput);
    expect(p.imageUrl).toBeNull();
  });

  it("should accept an explicit imageUrl", () => {
    const p = Product.create({ ...validInput, imageUrl: "https://cdn.example.com/img.jpg" });
    expect(p.imageUrl).toBe("https://cdn.example.com/img.jpg");
  });

  it("should throw when price is negative", () => {
    expect(() => Product.create({ ...validInput, price: -1 })).toThrow();
  });

  it("should throw when whatsappNumber is invalid", () => {
    expect(() => Product.create({ ...validInput, whatsappNumber: "abc" })).toThrow();
  });
});

describe("Product.reconstitute()", () => {
  it("should restore a product from persisted props", () => {
    const created = Product.create(validInput);
    const restored = Product.reconstitute({
      id: created.id,
      name: created.name,
      description: created.description,
      price: created.price,
      stock: created.stock,
      whatsappNumber: created.whatsappNumber,
      imageUrl: created.imageUrl,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
    });
    expect(restored.id).toBe(created.id);
    expect(restored.price.value).toBe(49.99);
  });
});
