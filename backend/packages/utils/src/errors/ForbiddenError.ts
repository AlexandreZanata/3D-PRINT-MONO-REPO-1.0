// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";

/** Authenticated but not authorised (HTTP 403). */
export class ForbiddenError extends AppError {
  readonly code: string;
  readonly httpStatus = 403 as const;

  constructor(message: string, code = "FORBIDDEN") {
    super(message);
    this.code = code;
  }
}
