// @max-lines 200 — this is enforced by the lint pipeline.

/**
 * Discriminated union representing either a successful value or a typed error.
 * Use Cases and Facades must return Result — never throw across layer boundaries.
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Construct a success result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Construct a failure result. */
export function err<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}
