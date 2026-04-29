import { describe, expect, it } from "vitest";
import { matchesAllowedIpEntry } from "./allowed-ip-entry.js";

describe("matchesAllowedIpEntry", () => {
  it("matches exact IPv4 after normalization", () => {
    expect(matchesAllowedIpEntry("127.0.0.1", "127.0.0.1")).toBe(true);
    expect(matchesAllowedIpEntry("::ffff:127.0.0.1", "127.0.0.1")).toBe(true);
  });

  it("matches IPv4 inside CIDR (Docker bridge range)", () => {
    expect(matchesAllowedIpEntry("172.18.0.9", "172.16.0.0/12")).toBe(true);
    expect(matchesAllowedIpEntry("172.18.0.9", "172.18.0.0/16")).toBe(true);
  });

  it("rejects IPv4 outside CIDR", () => {
    expect(matchesAllowedIpEntry("10.0.0.1", "172.18.0.0/16")).toBe(false);
  });

  it("rejects when entry is empty", () => {
    expect(matchesAllowedIpEntry("127.0.0.1", "")).toBe(false);
    expect(matchesAllowedIpEntry("127.0.0.1", "   ")).toBe(false);
  });

  it("rejects invalid CIDR prefix", () => {
    expect(matchesAllowedIpEntry("172.18.0.9", "172.18.0.0/99")).toBe(false);
  });

  it("matches IPv6 loopback exactly", () => {
    expect(matchesAllowedIpEntry("::1", "::1")).toBe(true);
    expect(matchesAllowedIpEntry("::1", "127.0.0.1")).toBe(false);
  });
});
