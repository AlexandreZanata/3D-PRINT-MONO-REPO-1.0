// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { err, ok, type Result } from "./result.js";

describe("ok()", () => {
  it("should return a success result with the given value", () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("should work with object values", () => {
    const payload = { id: "abc", name: "test" };
    const result = ok(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toStrictEqual(payload);
    }
  });

  it("should work with null as a valid value", () => {
    const result = ok(null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });
});

describe("err()", () => {
  it("should return a failure result with the given error", () => {
    const error = new Error("something went wrong");
    const result = err(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(error);
    }
  });

  it("should work with string errors", () => {
    const result = err("NOT_FOUND");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("NOT_FOUND");
    }
  });
});

describe("Result type narrowing", () => {
  function divide(a: number, b: number): Result<number, string> {
    if (b === 0) return err("DIVISION_BY_ZERO");
    return ok(a / b);
  }

  it("should narrow to value on success", () => {
    const result = divide(10, 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(5);
    }
  });

  it("should narrow to error on failure", () => {
    const result = divide(10, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("DIVISION_BY_ZERO");
    }
  });
});
