import { describe, expect, it } from "vitest";
import { isPublicImageRef } from "./image-ref.js";

describe("isPublicImageRef", () => {
  it("accepts https URLs", () => {
    expect(isPublicImageRef("https://cdn.example.com/a.jpg")).toBe(true);
  });

  it("accepts upload API paths", () => {
    expect(isPublicImageRef("/api/v1/uploads/abc-123.jpg")).toBe(true);
  });

  it("rejects empty and whitespace", () => {
    expect(isPublicImageRef("")).toBe(false);
    expect(isPublicImageRef("   ")).toBe(false);
  });

  it("rejects non-http protocols", () => {
    expect(isPublicImageRef("javascript:alert(1)")).toBe(false);
  });

  it("rejects upload paths with traversal or slashes in filename", () => {
    expect(isPublicImageRef("/api/v1/uploads/../etc/passwd")).toBe(false);
    expect(isPublicImageRef("/api/v1/uploads/a/b")).toBe(false);
  });

  it("rejects malformed upload prefix", () => {
    expect(isPublicImageRef("/api/v1/uploads/")).toBe(false);
  });
});
