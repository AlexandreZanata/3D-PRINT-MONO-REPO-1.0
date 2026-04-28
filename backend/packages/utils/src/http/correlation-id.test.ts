// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it, vi } from "vitest";
import { CORRELATION_HEADER, correlationIdMiddleware } from "./correlation-id.js";

const makeReqRes = (existingHeader?: string) => {
  const req = {
    headers: existingHeader ? { [CORRELATION_HEADER]: existingHeader } : {},
  };
  const headers: Record<string, string> = {};
  const locals: Record<string, unknown> = {};
  const res = {
    locals,
    setHeader: vi.fn((k: string, v: string) => { headers[k] = v; }),
  };
  return { req, res, headers };
};

describe("correlationIdMiddleware()", () => {
  it("should generate a UUID when no header is present", () => {
    const { req, res, headers } = makeReqRes();
    const next = vi.fn();

    correlationIdMiddleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledOnce();
    expect(typeof res.locals["correlationId"]).toBe("string");
    expect(res.locals["correlationId"]).toHaveLength(36); // UUID v4 length
    expect(headers[CORRELATION_HEADER]).toBe(res.locals["correlationId"]);
  });

  it("should reuse an existing correlation ID from the request header", () => {
    const existingId = "test-correlation-id-123";
    const { req, res } = makeReqRes(existingId);
    const next = vi.fn();

    correlationIdMiddleware(req as never, res as never, next);

    expect(res.locals["correlationId"]).toBe(existingId);
  });

  it("should always call next()", () => {
    const { req, res } = makeReqRes();
    const next = vi.fn();

    correlationIdMiddleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
