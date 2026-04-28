// @max-lines 200 — this is enforced by the lint pipeline.
import type { Request, Response } from "express";

export type HealthStatus = "ok" | "degraded" | "down";

export interface HealthChecks {
  readonly db: HealthStatus;
  readonly redis: HealthStatus;
  readonly rabbitmq: HealthStatus;
}

export interface HealthResponse {
  readonly status: HealthStatus;
  readonly checks: HealthChecks;
  readonly uptime: number;
  readonly version: string;
}

export type CheckFn = () => Promise<HealthStatus>;

export interface HealthCheckDeps {
  readonly db: CheckFn;
  readonly redis: CheckFn;
  readonly rabbitmq: CheckFn;
  readonly version: string;
}

/**
 * Derives the overall status from individual check results.
 * "down" if any check is "down", "degraded" if any is "degraded", else "ok".
 */
export function deriveOverallStatus(checks: HealthChecks): HealthStatus {
  const values = [checks.db, checks.redis, checks.rabbitmq];
  if (values.includes("down")) return "down";
  if (values.includes("degraded")) return "degraded";
  return "ok";
}

/**
 * Returns an Express request handler for GET /health.
 * Runs all dependency checks in parallel and returns a structured response.
 * HTTP 200 when status is "ok" or "degraded", 503 when "down".
 */
export function createHealthHandler(deps: HealthCheckDeps) {
  return async (_req: Request, res: Response): Promise<void> => {
    const [db, redis, rabbitmq] = await Promise.all([deps.db(), deps.redis(), deps.rabbitmq()]);

    const checks: HealthChecks = { db, redis, rabbitmq };
    const status = deriveOverallStatus(checks);

    const body: HealthResponse = {
      status,
      checks,
      uptime: process.uptime(),
      version: deps.version,
    };

    const httpStatus = status === "down" ? 503 : 200;
    res.status(httpStatus).json(body);
  };
}
