# @repo/sse-adapter

Server-Sent Events manager using Node.js `EventEmitter` and Express `Response`.

## Purpose

Maintains a `Map<connectionId, Response>` of active SSE connections. Broadcasts
typed product events to all connected clients. Sends a heartbeat comment every
30 seconds to prevent proxy timeouts. Enforces a configurable max connection limit.

## Public API

### Class
- `SSEManager` — manages all SSE connections and broadcasts

### Methods
- `addConnection(id, res)` — registers a new SSE client (returns false if max reached)
- `removeConnection(id)` — removes a disconnected client
- `broadcast(eventType, payload)` — sends event to all clients
- `connectionCount()` — returns current active connection count
- `close()` — closes all connections and stops heartbeat

### Types
- `SSEEventType` — `"product.created" | "product.updated" | "product.deleted"`
- `SSEEventPayload` — event data structure
- `SSEConnection` — connection metadata
- `SSEManagerConfig` — configuration options

## Event Format

```
event: product.created
data: {"productId":"...","name":"...","price":49.99,"eventId":"...","occurredAt":"..."}
id: <eventId>
retry: 3000

```

## How to run tests

```bash
pnpm --filter @repo/sse-adapter test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/utils` | Logger |
