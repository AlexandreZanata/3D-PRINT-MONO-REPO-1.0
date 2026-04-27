// @max-lines 200 — this is enforced by the lint pipeline.

/** Base error for domain-layer failures. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
