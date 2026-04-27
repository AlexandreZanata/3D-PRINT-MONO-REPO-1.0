# @repo/db-adapter

Drizzle ORM adapter for PostgreSQL with UUIDv7 primary keys.

## Purpose

Implements all repository interfaces defined in `@repo/domain` using Drizzle ORM
and the `postgres` driver. Manages schema definitions, migrations, and a seed
script for local development.

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
