import { describe, expect, it } from "vitest";
import { resolveApiBaseUrlFromEnv } from "./resolveApiBaseUrl";

describe("resolveApiBaseUrlFromEnv", () => {
  it("returns empty string in dev so the Vite proxy handles /api (happy path)", () => {
    expect(
      resolveApiBaseUrlFromEnv({
        DEV: true,
        VITE_API_BASE_URL: "http://localhost:3000",
      }),
    ).toBe("");
  });

  it("returns VITE_API_BASE_URL in production when set", () => {
    expect(
      resolveApiBaseUrlFromEnv({
        DEV: false,
        VITE_API_BASE_URL: "https://api.example.com",
      }),
    ).toBe("https://api.example.com");
  });

  it("returns empty string in production when env is missing (edge: same-origin deploy)", () => {
    expect(resolveApiBaseUrlFromEnv({ DEV: false })).toBe("");
  });

  it("returns empty string in production when env is empty string (failure to configure)", () => {
    expect(
      resolveApiBaseUrlFromEnv({
        DEV: false,
        VITE_API_BASE_URL: "",
      }),
    ).toBe("");
  });
});
