// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { EmailVO } from "./EmailVO.js";

describe("EmailVO.create()", () => {
  it("should create a valid email and normalise to lowercase", () => {
    const vo = EmailVO.create("Admin@Example.COM");
    expect(vo.value).toBe("admin@example.com");
  });

  it("should trim surrounding whitespace", () => {
    const vo = EmailVO.create("  user@domain.io  ");
    expect(vo.value).toBe("user@domain.io");
  });

  it("should throw for an address without @", () => {
    expect(() => EmailVO.create("notanemail")).toThrow("invalid email");
  });

  it("should throw for an address without a domain", () => {
    expect(() => EmailVO.create("user@")).toThrow();
  });

  it("should throw for an empty string", () => {
    expect(() => EmailVO.create("")).toThrow();
  });

  it("should return true for equals() with same normalised value", () => {
    const a = EmailVO.create("User@Example.com");
    const b = EmailVO.create("user@example.com");
    expect(a.equals(b)).toBe(true);
  });
});
