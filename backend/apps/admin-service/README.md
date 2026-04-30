# @repo/admin-service

Admin panel API with role-based access control, CSRF protection, and audit logging.

## Purpose

Provides authenticated admin endpoints for product management, audit log retrieval,
and session management. Every mutation is recorded in the audit_logs table.

### Product images

- `GET /api/v1/admin/products/:id` returns a single product (same auth and IP rules as other admin routes).
- `POST /api/v1/admin/uploads` accepts `multipart/form-data` with field `file` (JPEG, PNG, or WebP, up to 5 MiB) and returns `{ "url": "/api/v1/uploads/<filename>" }`.
- `GET /api/v1/uploads/<filename>` serves files from `ADMIN_UPLOAD_DIR` (default `./data/uploads`). In Docker Compose, mount the `admin_uploads` volume and set `ADMIN_UPLOAD_DIR=/data/uploads`.

See `poc.http` for example requests and [ADR-0005](../../../docs/adr/0005-admin-media-uploads.md).

## Public API

No exported types — this is a runnable application.

## Local development

`pnpm dev` runs **`tsx watch src/index.ts`** so TypeScript changes apply without a separate `tsc` step. On startup, if **`backend/.env`** exists (copy from `backend/.env.example`), it is loaded automatically so `POSTGRES_*`, `JWT_*`, etc. are set.

If **`EADDRINUSE`** on port 3002, another process is bound there (often a previous `dev` run, **Docker Compose `admin-service`**, or **turbo dev**). Stop it or run with `ADMIN_SERVICE_PORT=3003 pnpm dev`. If you still use `node dist/index.js`, run **`pnpm build`** after pulling so `dist/` includes new routes (otherwise `POST /api/v1/admin/uploads` can 404 with a plain HTML Express page).

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
