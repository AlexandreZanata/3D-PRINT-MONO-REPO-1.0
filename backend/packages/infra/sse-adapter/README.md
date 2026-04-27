# @repo/sse-adapter

Server-Sent Events manager using Node.js `EventEmitter` and Express `Response`.

## Purpose

Maintains a `Map<connectionId, Response>` of active SSE connections. Broadcasts
typed product events to all connected clients. Sends a heartbeat comment every
30 seconds to prevent proxy timeouts. Enforces a configurable max connection limit.

## Public API

### Class
- `SSEManager` — singleton-style manager

### Methods
- `SSEManager.addConnection(id, res)` — registers a new SSE client
- `SSEManager.removeConnection(id)` — removes a disconnected client
- `SSEManager.broadcast(eventType, payload)` — sends event to all clients
- `SSEManager.connectionCount()` — returns current active connection count

## How to run tests

```bash
pnpm --filter @repo/sse-adapter test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/utils` | Logger |
