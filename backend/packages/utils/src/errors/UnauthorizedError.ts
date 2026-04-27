// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";

/** Missing or invalid authentication (HTTP 401). */
export class UnauthorizedError extends AppError {
  readonly code: string;
  readonly httpStatus = 401 as const;

  constructor(message: string, code = "UNAUTHORIZED") {
    super(message);
    this.code = code;
  }
}
