// @max-lines 200 — this is enforced by the lint pipeline.

/**
 * Represents a validated WhatsApp-compatible phone number.
 * Accepts E.164 format: digits only, 7–15 chars, optional leading +.
 */
export class WhatsAppNumberVO {
  private readonly _value: string;

  /** Stored without the leading + so it can be used directly in wa.me URLs. */
  private constructor(value: string) {
    this._value = value;
  }

  static create(raw: string): WhatsAppNumberVO {
    const digits = raw.replace(/^\+/, "");
    if (!/^\d{7,15}$/.test(digits)) {
      throw new Error(`WhatsAppNumberVO: invalid number "${raw}" — must be 7–15 digits (E.164)`);
    }
    return new WhatsAppNumberVO(digits);
  }

  /** Digits-only value, suitable for wa.me deep-links. */
  get value(): string {
    return this._value;
  }

  /** Full E.164 representation with leading +. */
  toE164(): string {
    return `+${this._value}`;
  }

  equals(other: WhatsAppNumberVO): boolean {
    return this._value === other._value;
  }
}
