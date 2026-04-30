import { describe, expect, it } from "vitest";
import { resolveProxyBodyMode } from "./resolve-proxy-body-mode.js";

describe("resolveProxyBodyMode", () => {
  it("returns multipart-pipe for multipart POST", () => {
    expect(resolveProxyBodyMode("POST", "multipart/form-data; boundary=----x", undefined)).toBe(
      "multipart-pipe",
    );
  });

  it("returns json-stringify when express.json populated body", () => {
    expect(resolveProxyBodyMode("POST", "application/json", { a: 1 })).toBe("json-stringify");
  });

  it("returns none for GET", () => {
    expect(resolveProxyBodyMode("GET", undefined, undefined)).toBe("none");
  });

  it("returns none for POST without body and non-multipart", () => {
    expect(resolveProxyBodyMode("POST", undefined, undefined)).toBe("none");
  });

  it("handles content-type array", () => {
    expect(resolveProxyBodyMode("PUT", ["multipart/form-data; boundary=y"], undefined)).toBe(
      "multipart-pipe",
    );
  });

  it("treats null parsed body as none when not multipart", () => {
    expect(resolveProxyBodyMode("PATCH", "application/json", null)).toBe("json-stringify");
  });
});
