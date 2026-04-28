# ADR-004: RabbitMQ for Asynchronous Product Events

## Status

Accepted

## Context

After a product is created, updated, or deleted, several side-effects must occur:

- A WhatsApp deep-link must be built and cached.
- An SSE notification must be broadcast to connected clients.
- Future integrations (email, analytics, inventory sync) may need the same events.

These side-effects must not block the HTTP response and must survive transient
failures in downstream consumers.

Options considered:

1. **Direct HTTP calls** — product-service calls notification-service synchronously.
2. **In-process EventEmitter** — events dispatched within the same Node.js process.
3. **Redis Pub/Sub** — lightweight publish/subscribe over Redis.
4. **RabbitMQ (AMQP)** — durable topic exchange with dead-letter support.
5. **Kafka** — distributed log for high-throughput event streaming.

## Decision

Use **RabbitMQ 3.13** with a topic exchange (`product.events`) and per-event-type
queues. Implement retry logic with exponential backoff (up to 3 attempts) and
route failed messages to a dead-letter queue (`product.events.dlq`).

## Rationale

### Why RabbitMQ over direct HTTP calls

Direct HTTP calls create tight coupling between services. If notification-service
is down, the product mutation fails. With RabbitMQ, the publisher succeeds as
long as the broker is available; consumers process events when they are ready.

### Why RabbitMQ over in-process EventEmitter

An in-process EventEmitter cannot survive process restarts. If the service
crashes after persisting to the database but before dispatching the event, the
side-effect is lost. RabbitMQ provides durability: messages survive broker
restarts and are redelivered if a consumer crashes mid-processing.

### Why RabbitMQ over Redis Pub/Sub

Redis Pub/Sub is fire-and-forget — if no consumer is subscribed at the moment
of publish, the message is lost. RabbitMQ queues buffer messages until a
consumer is ready, providing at-least-once delivery guarantees.

### Why RabbitMQ over Kafka

Kafka is optimised for high-throughput log streaming (millions of events/sec).
This platform's event volume does not justify Kafka's operational complexity
(ZooKeeper/KRaft, partition management, consumer group offsets). RabbitMQ is
simpler to operate and sufficient for the expected load.

## Implementation Details

### Exchange topology

```
product.events (topic, durable)
  product.created  →  product.created.queue  (durable, DLX: product.events.dlx)
  product.updated  →  product.updated.queue  (durable, DLX: product.events.dlx)
  product.deleted  →  product.deleted.queue  (durable, DLX: product.events.dlx)

product.events.dlx (topic, durable)
  #  →  product.events.dlq  (durable)
```

### Message envelope

```json
{
  "eventId": "<UUIDv4>",
  "eventType": "product.created",
  "occurredAt": "2024-01-01T00:00:00.000Z",
  "payload": { "productId": "...", "name": "...", "price": 49.99 }
}
```

### Retry strategy

- Consumer uses manual acknowledgement (`noAck: false`).
- On handler failure: republish with `x-retry-count` header incremented.
- Exponential backoff: 1s, 2s, 4s (base 1000ms × 2^retryCount).
- After 3 failures: `nack(false, false)` → message routes to DLQ.
- DLQ is monitored; operators can inspect and replay failed messages.

## Consequences

### Positive

- Decoupled services — product-service does not know about notification-service.
- Durable delivery — messages survive consumer restarts.
- Extensible — new consumers can subscribe to existing queues without changing publishers.
- Dead-letter queue provides a safety net for debugging failed messages.
- Management UI (port 15672) gives visibility into queue depths and consumer status.

### Negative

- Operational dependency — RabbitMQ must be running for mutations to publish events.
- At-least-once delivery — consumers must be idempotent (currently acceptable).
- Additional infrastructure to manage in production.

### Mitigation

- RabbitMQ runs in Docker with a health check; services wait for it to be healthy.
- Consumer idempotency is acceptable for the current use cases (link caching is
  idempotent by nature — overwriting the same key with the same value is safe).

## References

- [RabbitMQ Topic Exchanges](https://www.rabbitmq.com/tutorials/tutorial-five-javascript)
- [RabbitMQ Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx)
- [amqplib documentation](https://amqp-node.github.io/amqplib/)
