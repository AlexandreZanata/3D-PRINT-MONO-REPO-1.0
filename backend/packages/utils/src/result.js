// @max-lines 200 — this is enforced by the lint pipeline.
/** Construct a success result. */
export function ok(value) {
    return { ok: true, value };
}
/** Construct a failure result. */
export function err(error) {
    return { ok: false, error };
}
//# sourceMappingURL=result.js.map