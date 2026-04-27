# @repo/db-adapter

Drizzle ORM adapter for PostgreSQL 18.1+ with native UUIDv7 primary keys.

## Purpose

Implements all repository interfaces defined in `@repo/domain` using Drizzle ORM
and the `postgres` driver. Manages schema definitions, migrations, and a seed
script for local development. Uses PostgreSQL 18.1+ native `gen_random_uuid_v7()`
function for UUIDv7 primary keys (no extension required).

## Public API

### Repositories
- `DrizzleProductRepository`
- `DrizzleAdminRepository`
- `DrizzleRefreshTokenRepository`
- `DrizzleAuditLogRepository`

### Schema
- `productsTable`
- `adminsTable`
- `refreshTokensTable`
- `auditLogsTable`

### Helpers
- `createDbClient(config)` — returns a Drizzle client instance

## How to run tests

```bash
pnpm --filter @repo/db-adapter test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/domain` | Repository interfaces and entity types |
| `@repo/utils` | InfraError, Result type, logger |
