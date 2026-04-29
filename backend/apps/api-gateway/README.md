# @repo/api-gateway

Entry point for all HTTP traffic. Handles routing, authentication middleware,
rate limiting, CORS, and request correlation.

## Purpose

Routes incoming requests to the appropriate downstream service, enforces JWT
authentication, applies Helmet security headers, and attaches a correlation ID
to every request.

## Public API

No exported types — this is a runnable application.

## How to run tests

`@repo/utils` must be built first (tests import `normalizeIp` from its `dist/`).

```bash
pnpm --filter @repo/utils build && pnpm --filter @repo/api-gateway test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/contracts` | Shared Zod schemas and API types |
| `@repo/utils` | Logger, Result type, error classes |
