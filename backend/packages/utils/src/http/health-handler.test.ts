// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it, vi } from "vitest";
import { createHealthHandler, deriveOverallStatus } from "./health-handler.js";
import type { HealthChecks } from "./health-handler.js";

describe("deriveOverallStatus()", () => {
  it("should return 'ok' when all checks pass", () => {
    const checks: HealthChecks = { db: "ok", redis: "ok", rabbitmq: "ok" };
    expect(deriveOverallStatus(checks)).toBe("ok");
  });

  it("should return 'degraded' when any check is degraded", () => {
    const checks: HealthChecks = { db: "ok", redis: "degraded", rabbitmq: "ok" };
    expect(deriveOverallStatus(checks)).toBe("degraded");
  });

  it("should return 'down' when any check is down", () => {
    const checks: HealthChecks = { db: "down", redis: "ok", rabbitmq: "ok" };
    expect(deriveOverallStatus(checks)).toBe("down");
  });

  it("should prioritise 'down' over 'degraded'", () => {
    const checks: HealthChecks = { db: "down", redis: "degraded", rabbitmq: "ok" };
    expect(deriveOverallStatus(checks)).toBe("down");
  });
});

describe("createHealthHandler()", () => {
  const makeRes = () => {
    const body: unknown[] = [];
    return {
      status: vi.fn().mockReturnThis(),
      json: vi.fn((b: unknown) => { body.push(b); }),
      _body: body,
    };
  };

  it("should return 200 and status 'ok' when all checks pass", async () => {
    const handler = createHealthHandler({
      db: async () => "ok",
      redis: async () => "ok",
      rabbitmq: async () => "ok",
      version: "1.0.0",
    });

    const res = makeRes();
    // Express req is not used in the handler
    await handler({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ok", version: "1.0.0" }),
    );
  });

  it("should return 503 when any check is 'down'", async () => {
    const handler = createHealthHandler({
      db: async () => "down",
      redis: async () => "ok",
      rabbitmq: async () => "ok",
      version: "1.0.0",
    });

    const res = makeRes();
    await handler({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "down" }),
    );
  });

  it("should return 200 when status is 'degraded'", async () => {
    const handler = createHealthHandler({
      db: async () => "ok",
      redis: async () => "degraded",
      rabbitmq: async () => "ok",
      version: "1.0.0",
    });

    const res = makeRes();
    await handler({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "degraded" }),
    );
  });
});
