// @max-lines 200 — this is enforced by the lint pipeline.
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const CORRELATION_HEADER = "x-correlation-id";

/**
 * Express middleware that reads or generates a correlation ID per request.
 * Stores it in res.locals["correlationId"] and echoes it in the response header.
 * Downstream services should forward the X-Correlation-ID header.
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const existing = req.headers[CORRELATION_HEADER];
  // Narrow: header values can be string | string[] | undefined
  const correlationId =
    typeof existing === "string" ? existing : randomUUID();

  res.locals["correlationId"] = correlationId;
  res.setHeader(CORRELATION_HEADER, correlationId);
  next();
}
