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
  it("creates a product with trimmed name and isActive=true", () => {
    const p = Product.create(validInput);
    expect(p.name).toBe("Vase");
    expect(p.isActive).toBe(true);
    expect(p.deletedAt).toBeNull();
    expect(p.price.value).toBe(49.99);
  });

  it("defaults optional rich fields when not provided", () => {
    const p = Product.create(validInput);
    expect(p.slug).toBeNull();
    expect(p.tagline).toBe("");
    expect(p.category).toBe("Decor");
    expect(p.material).toBe("");
    expect(p.dimensions).toBe("");
    expect(p.images).toEqual([]);
    expect(p.imageUrl).toBeNull();
  });

  it("accepts all rich fields when provided", () => {
    const p = Product.create({
      ...validInput,
      slug: "facet-vase",
      tagline: "Low-poly silhouette",
      category: "Lighting",
      material: "Matte PLA",
      dimensions: "18 × 14 cm",
      imageUrl: "https://cdn.example.com/img.jpg",
      images: ["https://cdn.example.com/img.jpg", "https://cdn.example.com/img2.jpg"],
    });
    expect(p.slug).toBe("facet-vase");
    expect(p.tagline).toBe("Low-poly silhouette");
    expect(p.category).toBe("Lighting");
    expect(p.material).toBe("Matte PLA");
    expect(p.dimensions).toBe("18 × 14 cm");
    expect(p.imageUrl).toBe("https://cdn.example.com/img.jpg");
    expect(p.images).toHaveLength(2);
  });

  it("throws when price is negative", () => {
    expect(() => Product.create({ ...validInput, price: -1 })).toThrow();
  });

  it("throws when whatsappNumber is invalid", () => {
    expect(() => Product.create({ ...validInput, whatsappNumber: "abc" })).toThrow();
  });
});

describe("Product.reconstitute()", () => {
  it("restores a product from persisted props including new fields", () => {
    const created = Product.create({
      ...validInput,
      slug: "vase",
      tagline: "A tagline",
      category: "Decor",
      material: "PLA",
      dimensions: "10cm",
      images: ["https://cdn.example.com/img.jpg"],
    });
    const restored = Product.reconstitute({
      id: created.id,
      name: created.name,
      slug: created.slug,
      tagline: created.tagline,
      category: created.category,
      material: created.material,
      dimensions: created.dimensions,
      description: created.description,
      price: created.price,
      stock: created.stock,
      whatsappNumber: created.whatsappNumber,
      imageUrl: created.imageUrl,
      images: created.images,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      deletedAt: created.deletedAt,
    });
    expect(restored.id).toBe(created.id);
    expect(restored.price.value).toBe(49.99);
    expect(restored.slug).toBe("vase");
    expect(restored.images).toHaveLength(1);
  });
});
