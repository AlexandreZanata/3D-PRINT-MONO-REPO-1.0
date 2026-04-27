// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";

/** Resource not found (HTTP 404). */
export class NotFoundError extends AppError {
  readonly code: string;
  readonly httpStatus = 404 as const;

  constructor(message: string, code = "NOT_FOUND") {
    super(message);
    this.code = code;
  }
}
