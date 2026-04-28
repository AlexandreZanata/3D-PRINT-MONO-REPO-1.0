import { describe, it, expect } from "vitest";
import { sanitize } from "./sanitize";

describe("sanitize", () => {
  it("should strip a simple HTML tag", () => {
    expect(sanitize("<b>Hello</b>")).toBe("Hello");
  });

  it("should strip script tags", () => {
    expect(sanitize("<script>alert(1)</script>")).toBe("alert(1)");
  });

  it("should strip multiple nested tags", () => {
    expect(sanitize("<div><p>Text</p></div>")).toBe("Text");
  });

  it("should return plain text unchanged", () => {
    expect(sanitize("Hello world")).toBe("Hello world");
  });

  it("should handle empty string", () => {
    expect(sanitize("")).toBe("");
  });

  it("should strip tags with attributes", () => {
    expect(sanitize('<a href="https://evil.com">click</a>')).toBe("click");
  });
});
