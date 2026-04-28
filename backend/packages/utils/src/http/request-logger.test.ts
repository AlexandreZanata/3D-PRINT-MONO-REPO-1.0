// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { anonymiseIp } from "./request-logger.js";

describe("anonymiseIp()", () => {
  it("should anonymise the last octet of an IPv4 address", () => {
    expect(anonymiseIp("192.168.1.42")).toBe("192.168.1.0");
  });

  it("should anonymise a public IPv4 address", () => {
    expect(anonymiseIp("203.0.113.99")).toBe("203.0.113.0");
  });

  it("should return IPv6 addresses unchanged", () => {
    expect(anonymiseIp("2001:db8::1")).toBe("2001:db8::1");
  });

  it("should return loopback unchanged", () => {
    expect(anonymiseIp("::1")).toBe("::1");
  });

  it("should return unknown string unchanged", () => {
    expect(anonymiseIp("unknown")).toBe("unknown");
  });
});
