# @repo/utils

Shared utilities: structured logger, error hierarchy, and `Result<T, E>` type.

## Purpose

Provides the foundational building blocks used across every package and app.
The `Result` type eliminates thrown exceptions across layer boundaries.
The error hierarchy maps domain concepts to HTTP status codes.

## Public API

### Result type
- `Result<T, E>` — `{ ok: true; value: T } | { ok: false; error: E }`
- `ok(value)` — constructs a success result
- `err(error)` — constructs a failure result

### Error classes
- `AppError` — base class (`code: string`, `httpStatus: number`)
- `DomainError` — 400
- `NotFoundError` — 404
- `UnauthorizedError` — 401
- `ForbiddenError` — 403
- `ConflictError` — 409
- `InfraError` — 500

### Logger
- `createLogger(service: string)` — returns a Pino logger instance

## How to run tests

```bash
pnpm --filter @repo/utils test
```

## Dependencies map

| Package | Reason |
|---|---|
| `pino` | Structured JSON logging |
