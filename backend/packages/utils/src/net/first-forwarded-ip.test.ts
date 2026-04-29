import { describe, expect, it } from "vitest";
import { firstForwardedIp } from "./first-forwarded-ip.js";

describe("firstForwardedIp", () => {
  it("returns the first comma-separated segment trimmed", () => {
    expect(firstForwardedIp("203.0.113.1, 10.0.0.1")).toBe("203.0.113.1");
    expect(firstForwardedIp("172.18.0.9")).toBe("172.18.0.9");
  });

  it("returns empty string for empty input", () => {
    expect(firstForwardedIp("")).toBe("");
  });

  it("trims leading segment", () => {
    expect(firstForwardedIp("  127.0.0.1  , 8.8.8.8")).toBe("127.0.0.1");
  });

  it("returns empty when the first segment is only whitespace", () => {
    expect(firstForwardedIp("   , 8.8.8.8")).toBe("");
  });
});
