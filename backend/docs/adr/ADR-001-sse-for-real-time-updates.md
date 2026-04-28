# ADR-001: Server-Sent Events for Real-Time Product Updates

## Status

Accepted

## Context

The e-commerce platform requires real-time notifications to clients when products are created, updated, or deleted. We need to choose a technology for pushing these updates from the server to connected clients.

Options considered:
1. **Server-Sent Events (SSE)** — unidirectional server-to-client push over HTTP
2. **WebSockets** — bidirectional full-duplex communication
3. **Long polling** — client repeatedly polls server for updates

## Decision

We will use **Server-Sent Events (SSE)** for real-time product updates.

## Rationale

### Why SSE over WebSockets:

1. **Unidirectional communication is sufficient** — clients only need to receive updates, not send messages back through the same channel. Product mutations happen via REST API.

2. **Simpler protocol** — SSE uses standard HTTP, no protocol upgrade required. Works seamlessly with existing HTTP infrastructure (load balancers, proxies, CDNs).

3. **Automatic reconnection** — browsers automatically reconnect on connection loss with built-in exponential backoff.

4. **Event ID tracking** — SSE has native support for event IDs, allowing clients to resume from the last received event after reconnection.

5. **Lower overhead** — no need for WebSocket handshake or frame encoding/decoding.

6. **Better for public endpoints** — SSE works well with standard HTTP authentication and doesn't require special firewall rules.

### Why SSE over Long Polling:

1. **Lower latency** — events are pushed immediately, no polling delay
2. **Reduced server load** — single persistent connection vs. repeated HTTP requests
3. **Lower bandwidth** — no repeated request/response headers

## Implementation Details

- **Endpoint**: `GET /api/v1/products/events`
- **Max connections**: 500 per instance (configurable via `SSE_MAX_CONNECTIONS`)
- **Heartbeat**: 30-second interval to keep connections alive
- **Event types**: `product.created`, `product.updated`, `product.deleted`
- **Retry**: 3000ms client-side retry interval
- **Observability**: Connection count stored in Redis sorted set

## Consequences

### Positive:

- Simple implementation with Node.js EventEmitter
- Works with standard HTTP tooling and monitoring
- Clients can use native browser EventSource API
- Graceful degradation if connection is lost

### Negative:

- Unidirectional only — if bidirectional communication is needed later, WebSockets would be required
- Limited browser support for custom headers (authentication must be via query params or cookies)
- Connection limit per instance requires horizontal scaling for high concurrency

### Mitigation:

- For authentication, use short-lived tokens in query params or rely on public access
- Scale horizontally behind a load balancer for high connection counts
- Monitor connection count via Redis to trigger auto-scaling

## Alternatives Considered

**WebSockets**: Rejected due to unnecessary complexity for unidirectional updates. Would require protocol upgrade, custom reconnection logic, and more complex infrastructure setup.

**Long Polling**: Rejected due to higher latency, increased server load, and bandwidth overhead from repeated requests.

## References

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [HTML5 SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
