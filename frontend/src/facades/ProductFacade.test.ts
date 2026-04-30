import { describe, it, expect } from "vitest";
import { toProduct, toProductList, toSiteSettings, toWhatsappUrl } from "./ProductFacade";
import type { ApiProduct } from "./ProductFacade";

const makeApiProduct = (overrides: Partial<ApiProduct> = {}): ApiProduct => ({
  id: "prod-1",
  name: "Geometric Vase",
  slug: "geometric-vase",
  tagline: "Low-poly silhouette",
  category: "Decor",
  material: "Matte PLA — Cream",
  dimensions: "18 × 14 × 14 cm",
  description: "A vase",
  price: "49.99",
  stock: "10",
  whatsappNumber: "+5511999999999",
  imageUrl: null,
  images: [],
  isActive: true,
  createdAt: "2026-04-28T00:00:00.000Z",
  updatedAt: "2026-04-28T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

describe("toProduct", () => {
  it("maps all fields from a raw API product", () => {
    const result = toProduct(makeApiProduct());
    expect(result.id).toBe("prod-1");
    expect(result.name).toBe("Geometric Vase");
    expect(result.slug).toBe("geometric-vase");
    expect(result.tagline).toBe("Low-poly silhouette");
    expect(result.category).toBe("Decor");
    expect(result.material).toBe("Matte PLA — Cream");
    expect(result.dimensions).toBe("18 × 14 × 14 cm");
    expect(result.price).toBe(49.99);
    expect(result.stock).toBe(10);
    expect(result.images).toEqual([]);
  });

  it("parses price from string to number", () => {
    const result = toProduct(makeApiProduct({ price: "89.50" }));
    expect(result.price).toBe(89.5);
  });

  it("accepts price as a number directly", () => {
    const result = toProduct(makeApiProduct({ price: 29.99 }));
    expect(result.price).toBe(29.99);
  });

  it("parses stock from string to integer", () => {
    const result = toProduct(makeApiProduct({ stock: "7" }));
    expect(result.stock).toBe(7);
  });

  it("preserves null imageUrl", () => {
    const result = toProduct(makeApiProduct({ imageUrl: null }));
    expect(result.imageUrl).toBeNull();
  });

  it("preserves null slug", () => {
    const result = toProduct(makeApiProduct({ slug: null }));
    expect(result.slug).toBeNull();
  });

  it("maps images array correctly", () => {
    const images = ["https://a.com/1.jpg", "https://a.com/2.jpg"];
    const result = toProduct(makeApiProduct({ images }));
    expect(result.images).toEqual(images);
  });

  it("falls back to imageUrl when gallery images are empty", () => {
    const result = toProduct(
      makeApiProduct({
        imageUrl: "/api/v1/uploads/hero.jpg",
        images: [],
      }),
    );
    expect(result.images).toEqual(["/api/v1/uploads/hero.jpg"]);
  });

  it("defaults images to empty array when not provided", () => {
    // Simulate old API response without images field
    const raw = makeApiProduct();
    // @ts-expect-error — intentionally omitting images to test fallback
    delete (raw as Partial<ApiProduct>).images;
    const result = toProduct(raw);
    expect(result.images).toEqual([]);
  });

  it("preserves deletedAt when set", () => {
    const result = toProduct(makeApiProduct({ deletedAt: "2026-05-01T00:00:00.000Z" }));
    expect(result.deletedAt).toBe("2026-05-01T00:00:00.000Z");
  });
});

describe("toProductList", () => {
  it("maps a list of raw products with pagination meta", () => {
    const result = toProductList({
      items: [makeApiProduct(), makeApiProduct({ id: "prod-2", name: "Lamp" })],
      page: 1,
      limit: 20,
      total: 2,
    });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("returns an empty list when items is empty", () => {
    const result = toProductList({ items: [], page: 1, limit: 20, total: 0 });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("maps each item through toProduct", () => {
    const result = toProductList({
      items: [makeApiProduct({ price: "55.00" })],
      page: 2,
      limit: 10,
      total: 1,
    });
    expect(result.items[0]?.price).toBe(55);
    expect(result.page).toBe(2);
  });
});

describe("toWhatsappUrl", () => {
  it("extracts the url from the API response", () => {
    const result = toWhatsappUrl({ url: "https://wa.me/5511999999999?text=Hi" });
    expect(result).toBe("https://wa.me/5511999999999?text=Hi");
  });
});

describe("toSiteSettings", () => {
  it("returns the raw map as-is", () => {
    const raw = { "hero.headline": "Objects, printed", "footer.copyright": "© 2026" };
    const result = toSiteSettings(raw);
    expect(result["hero.headline"]).toBe("Objects, printed");
    expect(result["footer.copyright"]).toBe("© 2026");
  });

  it("returns an empty object for empty input", () => {
    const result = toSiteSettings({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});
