import type { IncomingHttpHeaders } from "node:http";
import { describe, expect, it } from "vitest";
import {
  forwardedForValueFromSocketPeer,
  withAdminUpstreamForwardedFor,
} from "./admin-proxy-headers.js";

describe("forwardedForValueFromSocketPeer", () => {
  it("normalizes IPv4 loopback", () => {
    expect(forwardedForValueFromSocketPeer("127.0.0.1")).toBe("127.0.0.1");
  });

  it("strips IPv4-mapped IPv6 prefix", () => {
    expect(forwardedForValueFromSocketPeer("::ffff:127.0.0.1")).toBe("127.0.0.1");
  });

  it("returns empty string when peer is undefined", () => {
    expect(forwardedForValueFromSocketPeer(undefined)).toBe("");
  });
});

describe("withAdminUpstreamForwardedFor", () => {
  it("replaces an existing x-forwarded-for with the peer-derived value", () => {
    const incoming: IncomingHttpHeaders = {
      "x-forwarded-for": "203.0.113.1",
      authorization: "Bearer x",
    };
    const out = withAdminUpstreamForwardedFor(incoming, "127.0.0.1");
    expect(out["x-forwarded-for"]).toBe("127.0.0.1");
    expect(out.authorization).toBe("Bearer x");
  });

  it("sets x-forwarded-for when absent", () => {
    const incoming: IncomingHttpHeaders = { host: "localhost:3000" };
    const out = withAdminUpstreamForwardedFor(incoming, "::1");
    expect(out["x-forwarded-for"]).toBe("::1");
    expect(out.host).toBe("localhost:3000");
  });
});
