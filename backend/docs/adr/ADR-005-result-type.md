# ADR-005: Result<T, E> Instead of Thrown Exceptions Across Layer Boundaries

## Status

Accepted

## Context

The application has multiple layers (controller → facade → use case → repository →
infra adapter). Errors can originate at any layer: a database constraint violation,
a domain validation failure, a Redis timeout, or an invalid JWT.

Two common approaches for propagating errors across layers:

1. **Throw exceptions** — any function can throw; callers use try/catch.
2. **Return a Result type** — functions return a discriminated union of success or failure.

## Decision

Define a `Result<T, E>` type in `@repo/utils`:

```typescript
type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E }
```

All use cases, facades, and repository methods must return `Result`, never throw.
Controllers are the only layer that unwrap `Result` and map errors to HTTP responses.
Infra adapters catch third-party exceptions and wrap them in `InfraError`.

## Rationale

### Why Result over thrown exceptions

**Explicit error paths.** When a function returns `Result<T, E>`, the caller
is forced to handle both the success and failure cases at compile time. With
thrown exceptions, the error path is invisible in the type signature — callers
can silently ignore errors.

**No unexpected propagation.** A thrown exception propagates up the call stack
until caught. In an async Express handler, an uncaught promise rejection can
crash the process or return a 500 with no context. `Result` keeps errors local
and explicit.

**Type-safe error discrimination.** The `E` type parameter carries the exact
error type. Controllers can pattern-match on `error instanceof NotFoundError`
to return 404 vs. `error instanceof UnauthorizedError` for 401, without
relying on duck-typing or string matching.

**Testability.** Use cases that return `Result` are trivial to test — no need
to assert that a function throws, which requires `expect(() => ...).toThrow()`
wrappers. Instead: `expect(result.ok).toBe(false)`.

### Why not neverthrow or fp-ts

`neverthrow` and `fp-ts` provide richer functional abstractions (chaining,
mapping, etc.) but introduce a learning curve and a runtime dependency.
The hand-rolled `Result` type is 10 lines, has zero dependencies, and is
immediately understandable by any TypeScript developer.

### Boundary rule

The rule is: **never throw across a layer boundary**. Within a single layer
(e.g., inside a domain entity's constructor), throwing is acceptable because
the caller is in the same layer and can handle it synchronously. The boundary
is crossed when a use case calls a repository, or a controller calls a facade.

## Implementation Details

```typescript
// packages/utils/src/result.ts
export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}
```

### Error hierarchy

```
AppError (base: code, httpStatus)
├── DomainError      400 — invalid domain input
├── NotFoundError    404 — entity not found
├── UnauthorizedError 401 — missing or invalid credentials
├── ForbiddenError   403 — insufficient permissions
├── ConflictError    409 — duplicate or state conflict
└── InfraError       500 — wraps third-party errors (DB, Redis, RabbitMQ)
```

Controllers map `AppError` subclasses to HTTP status codes via `err.httpStatus`.
Unknown errors (not `AppError`) are caught by the global error handler and
returned as 500 with the message hidden in production.

## Consequences

### Positive

- Error paths are visible in function signatures.
- TypeScript enforces handling of both branches at every call site.
- Controllers have a single, consistent pattern for mapping errors to HTTP.
- Tests are simpler and more readable.
- No accidental exception swallowing.

### Negative

- More verbose than `throw` — every call site must check `result.ok`.
- Cannot use `await` directly on a `Result`-returning function without unwrapping.
- Developers unfamiliar with the pattern need a brief onboarding.

### Mitigation

- The `ok()` and `err()` helpers keep call sites concise.
- The pattern is documented here and in `packages/utils/README.md`.
- The compiler enforces correct usage — incorrect code does not compile.

## References

- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [neverthrow](https://github.com/supermacro/neverthrow) — rejected alternative
