# @repo/queue-adapter

RabbitMQ adapter using amqplib, implementing `QueuePublisher` and `QueueConsumer`
interfaces from `@repo/domain`.

## Purpose

Manages the `product.events` topic exchange, dead-letter exchange, and all queues.
Implements retry logic with exponential backoff (up to 3 attempts) and routes
failed messages to the DLQ after exhausting retries.

## Public API

### Publisher
- `RabbitMQPublisher` — implements `QueuePublisher`

### Consumer
- `RabbitMQConsumer` — implements `QueueConsumer`

### Setup
- `setupTopology(channel)` — declares exchange, queues, and bindings

## How to run tests

```bash
pnpm --filter @repo/queue-adapter test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/domain` | `QueuePublisher`, `QueueConsumer` interfaces |
| `@repo/utils` | InfraError, Result type, logger |
