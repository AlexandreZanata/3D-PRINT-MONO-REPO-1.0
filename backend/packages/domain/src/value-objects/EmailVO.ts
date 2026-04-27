// @max-lines 200 — this is enforced by the lint pipeline.

/** RFC-5322 simplified email regex — good enough for domain validation. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Represents a validated, normalised (lowercase) email address. */
export class EmailVO {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(raw: string): EmailVO {
    const normalised = raw.trim().toLowerCase();
    if (!EMAIL_RE.test(normalised)) {
      throw new Error(`EmailVO: invalid email address "${raw}"`);
    }
    return new EmailVO(normalised);
  }

  get value(): string {
    return this._value;
  }

  equals(other: EmailVO): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
