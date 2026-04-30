import { describe, expect, it } from "vitest";
import { isMulterFileSizeError, isUnsupportedImageUploadError } from "./upload-error-guards.js";

describe("isMulterFileSizeError", () => {
  it("detects LIMIT_FILE_SIZE MulterError", () => {
    expect(isMulterFileSizeError({ name: "MulterError", code: "LIMIT_FILE_SIZE" })).toBe(true);
  });

  it("rejects other errors", () => {
    expect(isMulterFileSizeError({ name: "MulterError", code: "LIMIT_UNEXPECTED_FILE" })).toBe(
      false,
    );
    expect(isMulterFileSizeError(null)).toBe(false);
    expect(isMulterFileSizeError("x")).toBe(false);
  });
});

describe("isUnsupportedImageUploadError", () => {
  it("detects fileFilter rejection message", () => {
    expect(isUnsupportedImageUploadError(new Error("UNSUPPORTED_IMAGE_TYPE"))).toBe(true);
  });

  it("rejects other messages", () => {
    expect(isUnsupportedImageUploadError(new Error("other"))).toBe(false);
    expect(isUnsupportedImageUploadError(undefined)).toBe(false);
  });
});
