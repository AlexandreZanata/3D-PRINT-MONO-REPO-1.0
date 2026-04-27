# @repo/admin-service

Admin panel API with role-based access control, CSRF protection, and audit logging.

## Purpose

Provides authenticated admin endpoints for product management, audit log retrieval,
and session management. Every mutation is recorded in the audit_logs table.

## Public API

No exported types — this is a runnable application.

## How to run tests

```bash
pnpm --filter @repo/admin-service test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/application` | Use cases and facades |
| `@repo/contracts` | Shared Zod schemas |
| `@repo/db-adapter` | PostgreSQL repository implementations |
| `@repo/cache-adapter` | Redis session store |
| `@repo/utils` | Logger, Result type, error classes |
