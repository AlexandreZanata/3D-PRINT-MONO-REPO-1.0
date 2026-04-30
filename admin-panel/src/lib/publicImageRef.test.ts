import { describe, expect, it } from "vitest";
import { isPublicImageRef } from "./publicImageRef";

describe("isPublicImageRef", () => {
  it("accepts https and upload paths", () => {
    expect(isPublicImageRef("https://cdn.example.com/a.jpg")).toBe(true);
    expect(isPublicImageRef("/api/v1/uploads/uuid.jpg")).toBe(true);
  });

  it("rejects traversal in upload path", () => {
    expect(isPublicImageRef("/api/v1/uploads/../x")).toBe(false);
  });

  it("treats null and undefined as invalid", () => {
    expect(isPublicImageRef(undefined)).toBe(false);
    expect(isPublicImageRef(null)).toBe(false);
  });
});
