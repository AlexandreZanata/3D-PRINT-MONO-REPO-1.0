# @repo/notification-service

RabbitMQ consumer that processes product events and generates WhatsApp deep-links.

## Purpose

Subscribes to all `product.*` RabbitMQ events, builds `wa.me` deep-links from
product data, stores them in Redis with a 24-hour TTL, and exposes a redirect
endpoint at `GET /api/v1/products/:id/whatsapp`.

## Public API

No exported types — this is a runnable application.

## How to run tests

```bash
pnpm --filter @repo/notification-service test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/application` | WhatsApp link use case |
| `@repo/contracts` | Shared Zod schemas |
| `@repo/cache-adapter` | Redis for link storage |
| `@repo/queue-adapter` | RabbitMQ consumer |
| `@repo/utils` | Logger, Result type, error classes |
