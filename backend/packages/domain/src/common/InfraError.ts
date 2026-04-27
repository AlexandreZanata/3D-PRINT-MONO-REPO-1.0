// @max-lines 200 — this is enforced by the lint pipeline.

/** Represents infrastructure-layer failures (DB, cache, queue, etc.). */
export class InfraError extends Error {
  readonly cause: Error;

  constructor(message: string, cause: Error) {
    super(message);
    this.name = "InfraError";
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
