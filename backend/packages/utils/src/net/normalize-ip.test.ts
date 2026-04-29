import { describe, expect, it } from "vitest";
import { normalizeIp } from "./normalize-ip.js";

describe("normalizeIp", () => {
  it("strips IPv4-mapped IPv6 prefix", () => {
    expect(normalizeIp("::ffff:127.0.0.1")).toBe("127.0.0.1");
  });

  it("returns plain IPv4 unchanged", () => {
    expect(normalizeIp("127.0.0.1")).toBe("127.0.0.1");
  });

  it("returns IPv6 loopback unchanged", () => {
    expect(normalizeIp("::1")).toBe("::1");
  });

  it("returns empty string unchanged", () => {
    expect(normalizeIp("")).toBe("");
  });
});
