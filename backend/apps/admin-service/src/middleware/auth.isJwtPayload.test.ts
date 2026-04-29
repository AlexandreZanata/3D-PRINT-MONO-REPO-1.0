import { describe, expect, it } from "vitest";
import { type JwtPayload, isJwtPayload } from "./auth.js";

describe("isJwtPayload", () => {
  it("accepts a valid JWT-shaped object", () => {
    const v: JwtPayload = {
      sub: "admin-1",
      role: "admin",
      iat: 1,
      exp: 2,
    };
    expect(isJwtPayload(v)).toBe(true);
  });

  it("rejects null", () => {
    expect(isJwtPayload(null)).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isJwtPayload("x")).toBe(false);
    expect(isJwtPayload(42)).toBe(false);
  });

  it("rejects when sub or role are not strings", () => {
    expect(isJwtPayload({ sub: 1, role: "admin", iat: 1, exp: 2 })).toBe(false);
    expect(isJwtPayload({ sub: "a", role: true, iat: 1, exp: 2 })).toBe(false);
  });

  it("rejects when iat or exp are not finite numbers", () => {
    expect(isJwtPayload({ sub: "a", role: "admin", iat: Number.NaN, exp: 2 })).toBe(false);
    expect(isJwtPayload({ sub: "a", role: "admin", iat: 1, exp: Number.POSITIVE_INFINITY })).toBe(
      false,
    );
  });

  it("rejects when iat or exp are missing", () => {
    expect(isJwtPayload({ sub: "a", role: "admin" })).toBe(false);
  });
});
