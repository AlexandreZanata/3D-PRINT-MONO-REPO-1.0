# Architecture — 3D Print Shop Backend

This document describes the system architecture using the C4 model expressed in
prose. Each level explains the structure and the reasoning behind every decision.

---

## Level 1 — System Context

The **3D Print Shop** backend serves two types of users:

- **Shoppers** — browse the public product catalog, view product details, receive
  real-time updates via SSE, and are redirected to WhatsApp to complete a purchase.
- **Admins** — manage the product catalog (create, update, soft-delete), view audit
  logs, and authenticate via JWT.

External systems:

| System | Role |
|---|---|
| **PostgreSQL 18.1+** | Primary data store for products, admins, tokens, audit logs |
| **Redis 7** | Session cache, refresh-token families, product cache, SSE subscriber tracking |
| **RabbitMQ 3.13** | Async event bus for product lifecycle events |
| **WhatsApp (wa.me)** | Deep-link redirect target for purchase intent |

**Why this stack?** Each external system was chosen for a specific reason:
PostgreSQL for ACID guarantees and native UUIDv7 (see ADR-002); Redis for
sub-millisecond key-value access and TTL-based expiry; RabbitMQ for durable,
routable async messaging with dead-letter support (see ADR-004); WhatsApp because
it is the dominant purchase channel for the target market.

---

## Level 2 — Container Diagram

The backend is a **pnpm monorepo** managed by Turborepo. It contains four
runnable applications and a set of shared packages.

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  api-gateway  :3000                                         │
│  Helmet · rate-limit · correlation-ID · reverse proxy       │
└──────────────┬──────────────────────────┬───────────────────┘
               │ /api/v1/products/*       │ /api/v1/auth/*
               │                         │ /api/v1/admin/*
               ▼                         ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│  product-service     │   │  admin-service  :3002            │
│  :3001               │   │  JWT · argon2 · audit log        │
│  Public catalog      │   │  Product CRUD (admin)            │
│  SSE broadcast       │   │  Auth (login/refresh/logout)     │
│  RabbitMQ publish    │   └──────────────────────────────────┘
└──────────────────────┘
               │ product.* events
               ▼
┌──────────────────────────────────────────────────────────────┐
│  notification-service  :3003                                 │
│  RabbitMQ consumer · WhatsApp link builder · Redis cache     │
└──────────────────────────────────────────────────────────────┘

Shared infrastructure: PostgreSQL · Redis · RabbitMQ
```

**Why four services?** Each service has a single, well-defined responsibility.
`product-service` owns the public read path and real-time updates.
`admin-service` owns authentication and privileged mutations.
`notification-service` owns async side-effects (WhatsApp links).
`api-gateway` owns cross-cutting concerns (security headers, rate limiting,
routing). This separation means each service can be scaled, deployed, and
reasoned about independently.

**Why a reverse proxy in the gateway instead of a shared router?**
The gateway is intentionally thin — it proxies HTTP without understanding
business logic. This keeps the gateway stable while downstream services evolve.

---

## Level 3 — Component Diagram (per service)

Every service follows the same internal layered architecture:

```
HTTP Request
     │
     ▼
Controller          — validates input (Zod), calls one Facade method, maps Result → HTTP
     │
     ▼
Facade              — orchestrates one or more Use Cases
     │
     ▼
Use Case            — single public execute() method, returns Result<T, AppError>
     │
     ▼
Repository Interface — defined in @repo/domain, implemented in @repo/infra/*
     │
     ▼
Infra Adapter       — Drizzle ORM / ioredis / amqplib
```

**Why this layering?** Each layer has a single reason to change. Controllers
change when the HTTP contract changes. Use cases change when business rules
change. Infra adapters change when the database or message broker changes.
No layer skips another — controllers never call repositories directly.

### Dependency Inversion

All dependencies point inward toward `@repo/domain`. Infra packages implement
interfaces declared in the domain. This means the domain has zero npm
dependencies and can be tested in complete isolation.

```
@repo/domain          ← zero deps, defines interfaces
@repo/application     ← depends on domain + contracts
@repo/infra/*         ← implements domain interfaces
apps/*                ← compose everything via composition-root.ts
```

### Result<T, E> — no thrown exceptions across boundaries

Use cases and facades return `Result<T, E>` instead of throwing. Controllers
unwrap the result and map errors to HTTP status codes. This makes error paths
explicit and type-safe. See ADR-005.

### Composition Root

Each app has a single `src/composition-root.ts` that wires all dependencies
manually via constructor injection. There is no IoC container. This keeps the
dependency graph explicit, readable, and easy to test.

---

## Level 4 — Key Cross-Cutting Concerns

### Authentication flow

```
POST /api/v1/auth/login
  → admin-service validates credentials (argon2id)
  → issues RS256 access token (15 min) + refresh token (7 days)
  → refresh token stored as SHA-256 hash in PostgreSQL
  → refresh token family tracked in Redis for reuse detection

POST /api/v1/auth/refresh
  → validates refresh token hash
  → if reused: revoke entire family (token theft protection)
  → if valid: rotate token, issue new pair
```

**Why RS256?** Asymmetric signing allows any service to verify tokens using
only the public key, without access to the private key. See ADR-006.

### Real-time updates (SSE)

```
GET /api/v1/products/events
  → SSEManager registers connection (max 500 per instance)
  → connection ID stored in Redis sorted set for observability
  → heartbeat every 30s to prevent proxy timeouts
  → on product mutation: broadcast to all connections
```

See ADR-001 for the rationale for SSE over WebSockets.

### Async event flow (RabbitMQ)

```
product-service mutates product
  → publishes to product.events exchange (topic)
  → routing key: product.created | product.updated | product.deleted
  → notification-service consumes from bound queues
  → builds wa.me deep-link, caches in Redis (TTL 24h)
  → on failure: retry up to 3× with exponential backoff
  → after 3 failures: NACK → dead-letter queue
```

See ADR-004 for the rationale for RabbitMQ.

### Observability

Every HTTP request carries an `X-Correlation-ID` header (generated at the
gateway if absent). All log entries include `correlationId`, `service`,
`level`, and ISO timestamp. Pino outputs structured JSON for ingestion by
any log aggregator (Loki, CloudWatch, Datadog).

Health endpoints (`GET /health`) on every service return:
```json
{ "status": "ok|degraded|down", "checks": { "db", "redis", "rabbitmq" }, "uptime", "version" }
```

### Security layers

| Layer | Mechanism |
|---|---|
| Transport | HTTPS enforced in production |
| Headers | Helmet (CSP, HSTS, noSniff, frameguard, xssFilter) |
| Rate limiting | express-rate-limit: 100/10/30 req/min by route group |
| Authentication | RS256 JWT, 15-min access tokens |
| Password hashing | argon2id |
| Admin access | JWT + role claim + IP allowlist |
| Audit trail | Every admin mutation logged to audit_logs table |
| Secrets | Environment variables only, never committed |
| Logging | Pino redacts password/secret/token/key fields automatically |
