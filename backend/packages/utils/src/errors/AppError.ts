// @max-lines 200 — this is enforced by the lint pipeline.

/** Base class for all application errors. */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
