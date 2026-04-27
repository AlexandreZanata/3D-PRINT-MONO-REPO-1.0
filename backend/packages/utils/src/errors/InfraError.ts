// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";

/** Wraps third-party / infrastructure failures (HTTP 500). */
export class InfraError extends AppError {
  readonly code: string;
  readonly httpStatus = 500 as const;
  /** The original error from the infrastructure layer. */
  readonly cause: Error;

  constructor(message: string, cause: Error, code = "INFRA_ERROR") {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}
