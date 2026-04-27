// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";

/** Represents a business-rule violation (HTTP 400). */
export class DomainError extends AppError {
  readonly code: string;
  readonly httpStatus = 400 as const;

  constructor(message: string, code = "DOMAIN_ERROR") {
    super(message);
    this.code = code;
  }
}
