import { describe, it, expect } from "vitest";
import { toProduct, toProductList, toWhatsappUrl } from "./ProductFacade";
import type { ApiProduct } from "./ProductFacade";

const makeApiProduct = (overrides: Partial<ApiProduct> = {}): ApiProduct => ({
  id: "prod-1",
  name: "Geometric Vase",
  description: "A vase",
  price: "49.99",
  stock: "10",
  whatsappNumber: "+5511999999999",
  imageUrl: null,
  isActive: true,
  createdAt: "2026-04-28T00:00:00.000Z",
  updatedAt: "2026-04-28T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

describe("toProduct", () => {
  it("should map a raw API product to a frontend Product", () => {
    const result = toProduct(makeApiProduct());
    expect(result.id).toBe("prod-1");
    expect(result.name).toBe("Geometric Vase");
    expect(result.price).toBe(49.99);
    expect(result.stock).toBe(10);
  });

  it("should parse price from string to number", () => {
    const result = toProduct(makeApiProduct({ price: "89.50" }));
    expect(result.price).toBe(89.5);
  });

  it("should accept price as a number directly", () => {
    const result = toProduct(makeApiProduct({ price: 29.99 }));
    expect(result.price).toBe(29.99);
  });

  it("should preserve null imageUrl", () => {
    const result = toProduct(makeApiProduct({ imageUrl: null }));
    expect(result.imageUrl).toBeNull();
  });

  it("should preserve non-null imageUrl", () => {
    const result = toProduct(makeApiProduct({ imageUrl: "https://example.com/img.jpg" }));
    expect(result.imageUrl).toBe("https://example.com/img.jpg");
  });

  it("should preserve deletedAt when set", () => {
    const result = toProduct(makeApiProduct({ deletedAt: "2026-05-01T00:00:00.000Z" }));
    expect(result.deletedAt).toBe("2026-05-01T00:00:00.000Z");
  });
});

describe("toProductList", () => {
  it("should map a list of raw products with pagination meta", () => {
    const result = toProductList({
      items: [makeApiProduct(), makeApiProduct({ id: "prod-2", name: "Lamp" })],
      page: 1,
      limit: 20,
      total: 2,
    });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
  });

  it("should return an empty list when items is empty", () => {
    const result = toProductList({ items: [], page: 1, limit: 20, total: 0 });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("toWhatsappUrl", () => {
  it("should extract the url from the API response", () => {
    const result = toWhatsappUrl({ url: "https://wa.me/5511999999999?text=Hi" });
    expect(result).toBe("https://wa.me/5511999999999?text=Hi");
  });
});
