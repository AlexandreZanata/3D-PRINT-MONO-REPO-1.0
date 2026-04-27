// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";

/** Resource conflict, e.g. duplicate unique key (HTTP 409). */
export class ConflictError extends AppError {
  readonly code: string;
  readonly httpStatus = 409 as const;

  constructor(message: string, code = "CONFLICT") {
    super(message);
    this.code = code;
  }
}
