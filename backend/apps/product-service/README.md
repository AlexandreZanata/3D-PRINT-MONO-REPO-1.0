# @repo/product-service

Handles product CRUD operations and publishes SSE + RabbitMQ events on mutations.

## Purpose

Exposes the public product catalog endpoints and the admin product management
endpoints. After every mutation it broadcasts an SSE event and publishes a
RabbitMQ domain event.

## Public API

No exported types — this is a runnable application.

## How to run tests

```bash
pnpm --filter @repo/product-service test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/application` | Use cases and facades |
| `@repo/contracts` | Shared Zod schemas |
| `@repo/db-adapter` | PostgreSQL repository implementations |
| `@repo/cache-adapter` | Redis cache |
| `@repo/queue-adapter` | RabbitMQ publisher |
| `@repo/sse-adapter` | SSE broadcast |
| `@repo/utils` | Logger, Result type, error classes |
