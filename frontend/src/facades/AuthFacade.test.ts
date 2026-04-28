import { describe, it, expect } from "vitest";
import { toSession } from "./AuthFacade";
import type { ApiLoginResponse } from "./AuthFacade";

// A real JWT with payload: { sub: "admin-1", role: "admin", iat: 1700000000, exp: 1700000900 }
// Header: {"alg":"RS256","typ":"JWT"}
// Payload: {"sub":"admin-1","role":"admin","iat":1700000000,"exp":1700000900}
// Signature: (fake — not verified client-side)
const FAKE_JWT =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." +
  btoa(JSON.stringify({ sub: "admin-1", role: "admin", iat: 1700000000, exp: 1700000900 }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "") +
  ".fakesignature";

const makeApiLoginResponse = (): ApiLoginResponse => ({
  success: true,
  data: {
    accessToken: FAKE_JWT,
    refreshToken: "some-refresh-token",
  },
});

describe("toSession", () => {
  it("should extract adminUser from the JWT payload", () => {
    const result = toSession(makeApiLoginResponse(), "admin@example.com");
    expect(result.adminUser.id).toBe("admin-1");
    expect(result.adminUser.role).toBe("admin");
    expect(result.adminUser.email).toBe("admin@example.com");
  });

  it("should preserve the accessToken", () => {
    const result = toSession(makeApiLoginResponse(), "admin@example.com");
    expect(result.accessToken).toBe(FAKE_JWT);
  });

  it("should throw when the JWT has fewer than 3 segments", () => {
    const oneSegment: ApiLoginResponse = {
      success: true,
      data: { accessToken: "onlyone", refreshToken: "" },
    };
    expect(() => toSession(oneSegment, "admin@example.com")).toThrow("Invalid JWT");
  });

  it("should throw when the JWT payload is not valid base64", () => {
    const badBase64: ApiLoginResponse = {
      success: true,
      data: { accessToken: "header.!!!invalid!!!.sig", refreshToken: "" },
    };
    expect(() => toSession(badBase64, "admin@example.com")).toThrow();
  });
});
