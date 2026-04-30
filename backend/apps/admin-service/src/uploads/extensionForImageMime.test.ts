import { describe, expect, it } from "vitest";
import { extensionForImageMime } from "./extensionForImageMime.js";

describe("extensionForImageMime", () => {
  it("maps jpeg, png, webp", () => {
    expect(extensionForImageMime("image/jpeg")).toBe(".jpg");
    expect(extensionForImageMime("image/png")).toBe(".png");
    expect(extensionForImageMime("image/webp")).toBe(".webp");
  });

  it("returns null for unsupported MIME", () => {
    expect(extensionForImageMime("image/gif")).toBeNull();
    expect(extensionForImageMime("application/octet-stream")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extensionForImageMime("")).toBeNull();
  });
});
