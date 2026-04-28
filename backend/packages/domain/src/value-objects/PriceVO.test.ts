// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { PriceVO } from "./PriceVO.js";

describe("PriceVO.create()", () => {
  it("should create a valid price for a positive number", () => {
    const price = PriceVO.create(99.99);
    expect(price.value).toBe(99.99);
  });

  it("should create a valid price for zero", () => {
    const price = PriceVO.create(0);
    expect(price.value).toBe(0);
  });

  it("should throw when value is negative", () => {
    expect(() => PriceVO.create(-1)).toThrow("non-negative");
  });

  it("should throw when value is NaN", () => {
    expect(() => PriceVO.create(Number.NaN)).toThrow();
  });

  it("should throw when value is Infinity", () => {
    expect(() => PriceVO.create(Number.POSITIVE_INFINITY)).toThrow();
  });

  it("should return true for equals() with same value", () => {
    const a = PriceVO.create(10);
    const b = PriceVO.create(10);
    expect(a.equals(b)).toBe(true);
  });

  it("should return false for equals() with different value", () => {
    const a = PriceVO.create(10);
    const b = PriceVO.create(20);
    expect(a.equals(b)).toBe(false);
  });

  it("should format toString() to 2 decimal places", () => {
    expect(PriceVO.create(5).toString()).toBe("5.00");
  });
});
