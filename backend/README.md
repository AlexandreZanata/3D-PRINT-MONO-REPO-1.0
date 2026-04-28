# @repo/root

Production-ready e-commerce backend monorepo.

## Stack

- **Runtime**: Node.js 22
- **Language**: TypeScript (strict)
- **Monorepo**: pnpm workspaces + Turborepo
- **Database**: PostgreSQL 18.1+ + Drizzle ORM + native UUIDv7
- **Cache / Session**: Redis 7 + ioredis
- **Queue**: RabbitMQ 3.13 + amqplib
- **HTTP**: Express
- **Validation**: Zod
- **Linting / Formatting**: Biome
- **Testing**: Vitest

## Quick start

```bash
cp .env.example .env
make dev
```

## Workspace layout

```
apps/
  api-gateway/          Entry point, routing, auth middleware
  product-service/      Product CRUD, SSE publisher
  admin-service/        Admin panel API, role-based access
  notification-service/ RabbitMQ consumer, WhatsApp redirect
packages/
  domain/               Entities, value objects, domain events (zero deps)
  application/          Use cases, facades, services, DTOs
  contracts/            Zod schemas, shared TypeScript interfaces
  infra/
    db-adapter/         Drizzle ORM + PostgreSQL
    cache-adapter/      Redis adapter
    queue-adapter/      RabbitMQ adapter
    sse-adapter/        SSE manager
  utils/                Logger (Pino), errors, Result<T,E>
infra/
  docker/               Dockerfiles per service
  docker-compose.yml
docs/
  architecture.md
  api.md
  adr/
```

## Available commands

| Command          | Description                          |
|------------------|--------------------------------------|
| `make dev`       | Start docker-compose + watch mode    |
| `make build`     | `turbo build`                        |
| `make test`      | `turbo test`                         |
| `make lint`      | `biome check`                        |
| `make migrate`   | `drizzle-kit migrate`                |
| `make seed`      | Run seed script                      |
| `make typecheck` | `tsc --noEmit` across all packages   |

## Commit convention

This project uses [Conventional Commits](https://www.conventionalcommits.org) enforced
by `commitlint` + `Lefthook`. Hooks are installed automatically on `pnpm install`.

```
<type>(<scope>): <subject>   # max 72 chars
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf` `ci` `revert`

Scopes map to workspace package names (e.g. `api-gateway`, `domain`, `db-adapter`).

Rule: no commit may touch more than 3 packages/apps at once (except `chore(deps)`).

See [ADR-003](docs/adr/ADR-003-commit-convention.md) for the full rationale.

## Documentation

- [Getting Started / Init Guide](docs/init.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [ADR Index](docs/adr/)
