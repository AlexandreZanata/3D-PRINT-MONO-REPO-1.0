// @max-lines 200 — this is enforced by the lint pipeline.
import type { NextFunction, Request, Response } from "express";
import type { AppLogger } from "../logger.js";
import { AppError } from "../errors/AppError.js";

export interface ApiErrorBody {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: string;
  };
}

/**
 * Express global error handler.
 * Maps AppError subclasses to their HTTP status codes.
 * Includes stack trace only in development.
 */
export function createErrorHandler(logger: AppLogger) {
  // Express error handlers must have exactly 4 parameters.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const correlationId = res.locals["correlationId"] as string | undefined;
    const log = correlationId ? logger.child({ correlationId }) : logger;

    if (err instanceof AppError) {
      log.warn(
        { code: err.code, httpStatus: err.httpStatus, path: req.path },
        err.message,
      );

      const body: ApiErrorBody = {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(process.env["NODE_ENV"] !== "production" && err.stack
            ? { details: err.stack }
            : {}),
        },
      };

      res.status(err.httpStatus).json(body);
      return;
    }

    // Unknown error — log full details, return generic 500
    const message = err instanceof Error ? err.message : "Internal server error";
    const stack = err instanceof Error ? err.stack : undefined;

    log.error(
      { path: req.path, ...(process.env["NODE_ENV"] !== "production" ? { stack } : {}) },
      message,
    );

    const body: ApiErrorBody = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: process.env["NODE_ENV"] === "production" ? "Internal server error" : message,
      },
    };

    res.status(500).json(body);
  };
}
