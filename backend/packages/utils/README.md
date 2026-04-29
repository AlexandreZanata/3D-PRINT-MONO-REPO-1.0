# @repo/utils

Shared utilities: structured logger, error hierarchy, `Result<T, E>` type, and HTTP middleware.

## Purpose

Provides the foundational building blocks used across every package and app.
The `Result` type eliminates thrown exceptions across layer boundaries.
The error hierarchy maps domain concepts to HTTP status codes.
The HTTP utilities provide correlation ID tracking, request logging, health checks, and error handling.

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
- `createLogger(service)` — returns a Pino logger instance
- `withCorrelation(logger, correlationId)` — returns a child logger with correlationId bound

### HTTP middleware (Section 12)
- `correlationIdMiddleware` — reads/generates `X-Correlation-ID` per request
- `requestLogger(logger)` — logs method, path, statusCode, durationMs, anonymised IP
- `createHealthHandler(deps)` — factory for `GET /health` endpoint
- `createErrorHandler(logger)` — global Express error handler (maps AppError → HTTP status)
- `anonymiseIp(ip)` — anonymises last IPv4 octet (e.g. `192.168.1.42` → `192.168.1.0`)
- `deriveOverallStatus(checks)` — derives `"ok" | "degraded" | "down"` from check results

### Networking
- `normalizeIp(ip)` — strips the `::ffff:` IPv4-mapped prefix (e.g. `::ffff:127.0.0.1` → `127.0.0.1`) for allowlists and proxy headers
- `matchesAllowedIpEntry(clientIp, entry)` — exact match after normalization, or IPv4 CIDR (`a.b.c.d/nn`) for ranges such as Docker `172.16.0.0/12`
- `firstForwardedIp(value)` — first trimmed segment of an `X-Forwarded-For`-style comma list

## How to run tests

```bash
pnpm --filter @repo/utils test
```

## Dependencies map

| Package | Reason |
|---|---|
| `pino` | Structured JSON logging |
| `express` (peer/dev) | Type definitions for HTTP middleware |
