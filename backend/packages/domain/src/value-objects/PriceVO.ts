// @max-lines 200 — this is enforced by the lint pipeline.

/**
 * Represents a validated, non-negative monetary price.
 * Throws on construction if the value is invalid — VOs are always valid.
 */
export class PriceVO {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static create(value: number): PriceVO {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`PriceVO: invalid price "${value}" — must be a non-negative finite number`);
    }
    return new PriceVO(value);
  }

  get value(): number {
    return this._value;
  }

  equals(other: PriceVO): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toFixed(2);
  }
}
