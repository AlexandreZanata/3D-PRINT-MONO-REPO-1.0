import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("should format a positive amount as USD", () => {
    expect(formatCurrency(49.99)).toBe("$49.99");
  });

  it("should format zero as $0.00", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should format a whole number without trailing zeros beyond 2 decimals", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("should format large amounts with comma separators", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });
});
