// @max-lines 200 — this is enforced by the lint pipeline.

/** Discriminated union representing either success or typed failure. */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
