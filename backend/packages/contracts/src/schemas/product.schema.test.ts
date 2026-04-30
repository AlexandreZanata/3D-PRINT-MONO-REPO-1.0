import { describe, expect, it } from "vitest";
import { CreateProductSchema } from "./product.schema.js";

describe("CreateProductSchema images", () => {
  const base = {
    name: "A",
    description: "D",
    price: 1,
    stock: 1,
    whatsappNumber: "+5511999999999",
  };

  it("accepts upload API path as imageUrl", () => {
    const parsed = CreateProductSchema.safeParse({
      ...base,
      imageUrl: "/api/v1/uploads/abc.jpg",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects unsafe upload paths", () => {
    const parsed = CreateProductSchema.safeParse({
      ...base,
      imageUrl: "/api/v1/uploads/../x.jpg",
    });
    expect(parsed.success).toBe(false);
  });
});
