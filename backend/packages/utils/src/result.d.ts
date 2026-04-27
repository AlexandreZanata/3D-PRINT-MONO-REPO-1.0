/**
 * Discriminated union representing either a successful value or a typed error.
 * Use Cases and Facades must return Result — never throw across layer boundaries.
 */
export type Result<T, E> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly error: E;
};
/** Construct a success result. */
export declare function ok<T>(value: T): Result<T, never>;
/** Construct a failure result. */
export declare function err<E>(error: E): Result<never, E>;
//# sourceMappingURL=result.d.ts.map