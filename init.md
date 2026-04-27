You are a senior TypeScript architect. Generate a complete, production-ready monorepo
backend project following every rule described below. Output only code and config files.
Never output explanations outside of inline code comments. All code, comments, variable
names, function names, file names, folder names, commit messages, and documentation must
be written entirely in English. Zero Portuguese, zero mixed language.

═══════════════════════════════════════════════════════════
SECTION 1 — PROJECT OVERVIEW
═══════════════════════════════════════════════════════════

Build a backend monorepo for an e-commerce-style platform with:
- Public product catalog (read-only, view products)
- Product registration (create / update / delete)
- Secure admin panel (authentication, authorization, product management)
- Real-time product updates via SSE (Server-Sent Events)
- WhatsApp redirect endpoint (generates a wa.me deep-link with product context)
- Asynchronous event processing via RabbitMQ
- Session and cache layer via Redis
- PostgreSQL as primary database using UUIDv7 natively (gen_random_uuid() replaced by
  pg_uuidv7 extension or equivalent; all primary keys are UUIDv7)

═══════════════════════════════════════════════════════════
SECTION 2 — REPOSITORY STRUCTURE (MONOREPO)
═══════════════════════════════════════════════════════════

Use pnpm workspaces + Turborepo. The root structure must be:

/
├── apps/
│   ├── api-gateway/          # Entry point, routing, auth middleware
│   ├── product-service/      # Product CRUD, SSE publisher
│   ├── admin-service/        # Admin panel API, role-based access
│   └── notification-service/ # RabbitMQ consumer, WhatsApp redirect
├── packages/
│   ├── domain/               # Entities, value objects, domain events (zero deps)
│   ├── application/          # Use cases, facades, services, DTOs (depends on domain)
│   ├── contracts/            # Zod schemas, shared TypeScript interfaces, API types
│   ├── infra/
│   │   ├── db-adapter/       # Drizzle ORM + PostgreSQL adapter
│   │   ├── cache-adapter/    # Redis adapter using ioredis
│   │   ├── queue-adapter/    # RabbitMQ adapter using amqplib
│   │   └── sse-adapter/      # SSE manager using Node EventEmitter
│   └── utils/                # Logger (Pino), custom errors, Result<T,E> type
├── infra/
│   ├── docker/               # Dockerfiles per service
│   └── docker-compose.yml    # PostgreSQL, Redis, RabbitMQ, all services
├── docs/
│   ├── architecture.md
│   ├── api.md                # OpenAPI 3.1 spec (YAML)
│   └── adr/                  # Architecture Decision Records (ADR-001, ADR-002 ...)
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
├── biome.json
├── commitlint.config.ts
└── README.md

Every package and app has its own:
- package.json (with "name": "@repo/<name>")
- tsconfig.json (extending /tsconfig.base.json)
- vitest.config.ts
- README.md

═══════════════════════════════════════════════════════════
SECTION 3 — FILE SIZE & COMPLEXITY LIMITS (HARD RULES)
═══════════════════════════════════════════════════════════

Every single file in the project must comply with these limits:

- Maximum 200 lines per file (blank lines and comments count)
- Maximum 30 lines per function/method
- Maximum 3 parameters per function (use an options object for more)
- Maximum cyclomatic complexity of 5 per function
- Maximum 1 exported class or 1 exported function set per file
- No file may import from more than 5 different packages
- No circular dependencies (enforced by Biome + madge in CI)

If any of these limits would be violated, split the file. Add a comment at the top of
each file: // @max-lines 200 — this is enforced by the lint pipeline.

═══════════════════════════════════════════════════════════
SECTION 4 — TYPESCRIPT CONFIGURATION
═══════════════════════════════════════════════════════════

Root tsconfig.base.json must enable:
"strict": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true,
"forceConsistentCasingInFileNames": true,
"verbatimModuleSyntax": true,
"moduleResolution": "bundler",
"target": "ES2022",
"lib": ["ES2022"],
"paths" must map all @repo/* packages

Use TypeScript project references (composite: true) so Turborepo can cache
type-checking incrementally.

═══════════════════════════════════════════════════════════
SECTION 5 — ARCHITECTURE PATTERNS (STRICT)
═══════════════════════════════════════════════════════════

5.1 LAYERED ARCHITECTURE (inside each app and inside packages/application)

Controller → Facade → Use Case → Repository Interface → Infra Adapter

- Controllers: handle HTTP, validate input with Zod, call one Facade method, return HTTP response. No business logic.
- Facades: orchestrate one or more Use Cases. The only layer that may coordinate multiple domain operations. Named *Facade.ts.
- Use Cases: one class, one public method execute(). Encapsulate a single business operation. Named *UseCase.ts.
- Services: stateless helpers called by Use Cases. Do NOT call repositories directly from services. Named *Service.ts.
- Repositories: interfaces defined in packages/domain. Implementations live in packages/infra/db-adapter.
- Domain Entities: plain TypeScript classes with private constructors and static create() factory. No ORM decorators. Named after the concept (Product.ts, Admin.ts).
- Value Objects: immutable, validated on construction, throw DomainError if invalid. Named *VO.ts.
- Domain Events: plain objects implementing a DomainEvent interface. Named *Event.ts.

5.2 DEPENDENCY INVERSION

- packages/domain must have ZERO external dependencies (no npm packages, only Node built-ins if needed).
- packages/application may only depend on packages/domain and packages/contracts.
- Infra adapters implement interfaces declared in packages/domain.
- Dependency injection is done manually via constructor injection — no IoC container framework.
- Each app composes its dependency graph in a single composition root file: src/composition-root.ts.

5.3 RESULT TYPE (no throwing across layer boundaries)

Define a Result<T, E extends AppError> type in packages/utils:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
All Use Cases and Facades must return Result, never throw.
Controllers unwrap Result and map to HTTP status codes.

5.4 ERROR HIERARCHY

packages/utils/src/errors/
AppError (base, has code: string and httpStatus: number)
├── DomainError      (400 range)
├── NotFoundError    (404)
├── UnauthorizedError (401)
├── ForbiddenError   (403)
├── ConflictError    (409)
└── InfraError       (500 range, wraps third-party errors)

═══════════════════════════════════════════════════════════
SECTION 6 — SECURITY (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════

6.1 Authentication
- JWT access tokens (15 min expiry) + refresh tokens (7 days, stored in Redis as a
  rotating token family to prevent reuse attacks).
- Refresh token rotation: every refresh invalidates the old token and issues a new one.
  If a reused refresh token is detected, revoke the entire family.
- Access tokens: signed with RS256 (asymmetric). Private key loaded from environment,
  never committed. Public key used for verification across services.
- Passwords: hashed with argon2id (argon2 npm package), never bcrypt.

6.2 Admin panel protection
- Separate /admin/* route group in api-gateway.
- Admin routes require: valid JWT + role "admin" claim + IP allowlist check (configurable
  via environment variable ADMIN_ALLOWED_IPS).
- Admin session additionally stored in Redis with a 30-minute sliding expiration.
- All admin mutations require a CSRF token (double-submit cookie pattern).
- Admin endpoints log every action to an audit_log table (who, what, when, IP, user-agent).

6.3 General HTTP security
- Helmet.js: contentSecurityPolicy, hsts, noSniff, frameguard, xssFilter all enabled.
- Rate limiting per IP via express-rate-limit + Redis store.
  Public endpoints: 100 req/min. Auth endpoints: 10 req/min. Admin endpoints: 30 req/min.
- All request bodies validated with Zod before reaching any controller logic.
- All string inputs sanitized (strip HTML tags) before persisting.
- Correlation ID (X-Correlation-ID header) generated per request (UUIDv4) and propagated
  to all downstream service calls and log entries.
- HTTPS only in production (enforced by middleware redirect in non-production it is
  skipped but clearly documented).

6.4 Secrets management
- All secrets (DB password, JWT private key, Redis password, RabbitMQ credentials) come
  from environment variables only.
- Provide a .env.example file with every required variable listed and documented.
- Never log secrets. The logger must redact any key matching /password|secret|token|key/i.

═══════════════════════════════════════════════════════════
SECTION 7 — DATABASE (POSTGRESQL + DRIZZLE ORM)
═══════════════════════════════════════════════════════════

7.1 UUIDv7
- Enable the pg_uuidv7 PostgreSQL extension in the migration bootstrap.
- All tables use id UUID PRIMARY KEY DEFAULT uuid_generate_v7().
- In the Drizzle schema, define a custom uuidv7() default helper that calls the PG function.

7.2 Schema (packages/infra/db-adapter/src/schema/)
One file per table. Each file exports a Drizzle table definition and the inferred
TypeScript types (SelectModel, InsertModel).

Tables:
products      — id, name, description, price (numeric), stock, whatsapp_number,
image_url, is_active, created_at, updated_at, deleted_at (soft delete)
admins        — id, email, password_hash, role, created_at, last_login_at
refresh_tokens— id, admin_id (FK), token_hash, family_id, expires_at, revoked_at
audit_logs    — id, admin_id, action, entity, entity_id, payload (jsonb), ip, ua, created_at

7.3 Migrations
- Use Drizzle Kit for migrations. Output to packages/infra/db-adapter/migrations/.
- Migration files named: YYYYMMDDHHMMSS_<description>.sql.
- Never edit an existing migration. Always create a new one.
- Provide a seed script at packages/infra/db-adapter/src/seed.ts for local development.

7.4 Repository pattern
Define interfaces in packages/domain/src/repositories/:
IProductRepository, IAdminRepository, IRefreshTokenRepository, IAuditLogRepository

Implement in packages/infra/db-adapter/src/repositories/:
DrizzleProductRepository, etc.

Each repository method returns Result<T, InfraError>.
Wrap every DB call in a try/catch that maps pg errors to typed InfraError subtypes.

═══════════════════════════════════════════════════════════
SECTION 8 — REDIS (CACHE + SESSION)
═══════════════════════════════════════════════════════════

- Use ioredis. Define a RedisClient interface in packages/domain.
- Cache adapter in packages/infra/cache-adapter implements RedisClient.
- Key naming convention (all keys snake_case with colon namespacing):
  session:admin:{adminId}        → admin session hash
  refresh_family:{familyId}      → set of token hashes in a family
  product:cache:{productId}      → serialized product JSON (TTL 5 min)
  product:list:cache             → serialized product list (TTL 1 min)
  rate_limit:{ip}:{endpoint}     → rate limit counter
  sse:subscribers                → sorted set of active SSE connection IDs
- All Redis operations wrapped in try/catch returning Result<T, InfraError>.
- Provide a CacheService in packages/application that encapsulates cache-aside logic
  (read from cache → on miss fetch from DB → write to cache → return).

═══════════════════════════════════════════════════════════
SECTION 9 — RABBITMQ (ASYNC EVENTS)
═══════════════════════════════════════════════════════════

- Use amqplib. Define a QueuePublisher and QueueConsumer interface in packages/domain.
- Queue adapter in packages/infra/queue-adapter implements both.
- Exchange topology:
  exchange: "product.events"  (topic, durable)
  routing key "product.created"   → queue "product.created.queue"
  routing key "product.updated"   → queue "product.updated.queue"
  routing key "product.deleted"   → queue "product.deleted.queue"
  Dead-letter exchange: "product.events.dlx"
  DLQ: "product.events.dlq" (for failed messages after 3 retries)
- Message envelope:
  { eventId: string (UUIDv4), eventType: string, occurredAt: ISO string, payload: unknown }
- Consumer must:
    - Acknowledge only after successful processing (manual ack).
    - On failure, retry up to 3 times with exponential backoff using message headers.
    - After 3 failures, NACK without requeue (routes to DLQ).
- notification-service subscribes to all product.* events and:
    - Builds a WhatsApp deep-link (https://wa.me/{number}?text=...) from product data.
    - Stores the last generated link in Redis with TTL 24h.
    - Logs the event in audit_logs via the admin-service internal API call.
- After product.created / product.updated / product.deleted, product-service also
  publishes an SSE notification through the SSE adapter.

═══════════════════════════════════════════════════════════
SECTION 10 — SSE (SERVER-SENT EVENTS)
═══════════════════════════════════════════════════════════

- SSE endpoint: GET /api/v1/products/events (public, no auth required).
- Each connection receives a unique connectionId (UUIDv4).
- SSEManager class (in packages/infra/sse-adapter) maintains a Map<string, Response>.
- On product mutation (create/update/delete), the product-service use case calls
  SSEManager.broadcast(eventType, payload) after persisting to DB.
- Event format (strict):
  event: product.created | product.updated | product.deleted
  data: { productId, name, price, eventId, occurredAt }
  id: <eventId>
  retry: 3000
- Heartbeat: send a comment (": heartbeat\n\n") every 30 seconds to keep connections alive.
- On client disconnect (req.on("close")), remove from SSEManager and log.
- SSE connections count stored in Redis sse:subscribers sorted set for observability.
- Max 500 concurrent SSE connections per instance (configurable via env SSE_MAX_CONNECTIONS).

═══════════════════════════════════════════════════════════
SECTION 11 — API DESIGN
═══════════════════════════════════════════════════════════

All responses follow a strict envelope:
Success: { success: true,  data: T,      meta?: { page, limit, total } }
Error:   { success: false, error: { code: string, message: string, details?: unknown } }

Versioning: all routes prefixed with /api/v1/.

Public endpoints (no auth):
GET    /api/v1/products                  list products (paginated, filters: name, min_price, max_price, is_active)
GET    /api/v1/products/:id              get product by id
GET    /api/v1/products/events           SSE stream
GET    /api/v1/products/:id/whatsapp     returns { url: "https://wa.me/..." }

Auth endpoints:
POST   /api/v1/auth/login                { email, password } → { accessToken, refreshToken }
POST   /api/v1/auth/refresh              { refreshToken } → { accessToken, refreshToken }
POST   /api/v1/auth/logout               revokes refresh token family

Admin endpoints (JWT + role:admin + CSRF):
GET    /api/v1/admin/products            list all products (including inactive)
POST   /api/v1/admin/products            create product
PUT    /api/v1/admin/products/:id        update product
DELETE /api/v1/admin/products/:id        soft-delete product
GET    /api/v1/admin/audit-logs          paginated audit log

All paginated endpoints accept: page (default 1), limit (default 20, max 100).
All list endpoints return X-Total-Count and X-Page headers.

Document the full OpenAPI 3.1 spec in docs/api.md (YAML format).

═══════════════════════════════════════════════════════════
SECTION 12 — LOGGING & OBSERVABILITY
═══════════════════════════════════════════════════════════

- Use Pino for structured JSON logging. One Logger instance per service.
- Log levels: trace | debug | info | warn | error | fatal.
- Every log entry must include: level, timestamp (ISO), correlationId, service, message.
- HTTP request logs: method, path, statusCode, durationMs, ip (anonymized last octet).
- Error logs: include stack only in development. In production include only code + message.
- Logger instantiated in packages/utils/src/logger.ts and injected — never use console.log.
- Provide a /health endpoint on each service returning:
  { status: "ok"|"degraded"|"down", checks: { db, redis, rabbitmq }, uptime, version }

═══════════════════════════════════════════════════════════
SECTION 13 — TESTING STRATEGY
═══════════════════════════════════════════════════════════

Use Vitest for all tests.

Unit tests (packages/domain, packages/application):
- Every Use Case must have a test file *UseCase.test.ts.
- Repositories and adapters are mocked using vi.fn().
- Test file lives next to the implementation file.
- Coverage target: 80% lines minimum (enforced in CI).

Integration tests (apps/*):
- Use Testcontainers (testcontainers npm package) to spin up real PostgreSQL, Redis, RabbitMQ.
- Integration test files named *.integration.test.ts.
- Placed in apps/<service>/test/integration/.

Rules:
- Tests must never call production external services.
- Each test file must be fully isolated (no shared mutable state between tests).
- Use describe blocks to group related tests.
- Test names must follow: "should <expected behavior> when <condition>".

═══════════════════════════════════════════════════════════
SECTION 14 — COMMIT CONVENTION & GIT WORKFLOW
═══════════════════════════════════════════════════════════

Use Conventional Commits (https://www.conventionalcommits.org) enforced by commitlint.

Commit format:
<type>(<scope>): <short description in imperative mood, max 72 chars>

[optional body — explain WHY, not WHAT. max 100 chars per line]

[optional footer: BREAKING CHANGE: ..., Closes #...]

Allowed types:
feat      — new feature
fix       — bug fix
docs      — documentation only
style     — formatting, no logic change
refactor  — code restructure, no behavior change
test      — adding or fixing tests
chore     — build, tooling, dependencies
perf      — performance improvement
ci        — CI/CD changes
revert    — reverts a previous commit

Allowed scopes (match monorepo package/app names):
api-gateway | product-service | admin-service | notification-service |
domain | application | contracts | db-adapter | cache-adapter |
queue-adapter | sse-adapter | utils | infra | docs | deps | release

Rules:
- Breaking changes must include BREAKING CHANGE footer and "!" after type+scope.
- No commit may contain changes to more than 3 packages/apps at once (except chore(deps)).
- Commit message subject must be in English, imperative mood, no period at end.

Configure commitlint.config.ts and husky pre-commit hook to enforce this automatically.

═══════════════════════════════════════════════════════════
SECTION 15 — TOOLING & CODE QUALITY
═══════════════════════════════════════════════════════════

- Biome for linting + formatting (replaces ESLint + Prettier).
  biome.json must enforce: no console.log, no any, no non-null assertion (!),
  prefer const, no unused variables, import order enforced.
- Lefthook (or husky) for git hooks:
  pre-commit: biome check + tsc --noEmit + vitest run --passWithNoTests
  commit-msg: commitlint
- Turborepo pipeline (turbo.json):
  build → depends on ^build
  test  → depends on ^build
  lint  → no deps
  typecheck → no deps
- madge for circular dependency detection (run in CI).
- @changesets/cli for versioning and changelog generation.

═══════════════════════════════════════════════════════════
SECTION 16 — DOCKER & LOCAL DEVELOPMENT
═══════════════════════════════════════════════════════════

infra/docker-compose.yml must define:
- postgres:16 with pg_uuidv7 extension pre-loaded via init script
- redis:7-alpine with password
- rabbitmq:3.13-management with preconfigured vhost and user
- adminer (DB UI, port 8080)
- Each app service (product-service, admin-service, notification-service, api-gateway)
with proper depends_on, healthcheck, and environment variable references.

Dockerfiles:
- Use multi-stage builds (base → builder → runner).
- runner stage uses node:22-alpine.
- Non-root user (node) in runner stage.
- .dockerignore excludes node_modules, .git, *.test.ts, docs.

Provide a Makefile at the repo root with targets:
make dev        — start docker-compose + watch mode
make build      — turbo build
make test       — turbo test
make lint       — biome check
make migrate    — drizzle-kit migrate
make seed       — run seed script
make typecheck  — tsc --noEmit across all packages

═══════════════════════════════════════════════════════════
SECTION 17 — DOCUMENTATION
═══════════════════════════════════════════════════════════

docs/architecture.md — C4 model in prose: Context, Container, Component diagrams described
as text. Must explain every architectural decision with a "why".

docs/api.md — Complete OpenAPI 3.1 YAML spec. Every endpoint documented with:
summary, description, request schema (Zod-derived), response schemas (success + error),
security requirements, example request/response.

docs/adr/ — Architecture Decision Records:
ADR-001: Why UUIDv7 over UUIDv4 or ULID
ADR-002: Why Drizzle ORM over Prisma
ADR-003: Why manual DI over an IoC container
ADR-004: Why RabbitMQ for async events
ADR-005: Why Result<T,E> instead of try/catch across layers
ADR-006: Why RS256 for JWT

Each ADR uses the template: Title · Status · Context · Decision · Consequences.

Every package README.md must include:
- Purpose (one paragraph)
- Public API (exported types and functions listed)
- How to run tests
- Dependencies map (what it imports from other @repo/* packages)

═══════════════════════════════════════════════════════════
SECTION 18 — FINAL CHECKLIST (GENERATE ALL OF THESE)
═══════════════════════════════════════════════════════════

Generate the following files completely (not as stubs):

1. All package.json files (root + each app + each package)
2. pnpm-workspace.yaml
3. turbo.json
4. biome.json
5. tsconfig.base.json + all tsconfig.json files
6. commitlint.config.ts
7. Makefile
8. .env.example
9. infra/docker-compose.yml
10. Dockerfiles for each app
11. packages/domain — all entities, value objects, domain events, repository interfaces
12. packages/application — all use cases, facades, services, DTOs
13. packages/contracts — all Zod schemas and TypeScript types
14. packages/utils — logger, errors, Result type
15. packages/infra/db-adapter — Drizzle schema, repositories, migrations bootstrap
16. packages/infra/cache-adapter — Redis client wrapper
17. packages/infra/queue-adapter — RabbitMQ publisher + consumer
18. packages/infra/sse-adapter — SSEManager
19. apps/api-gateway — server setup, middleware, routes, composition root
20. apps/product-service — controllers, composition root
21. apps/admin-service — controllers, composition root
22. apps/notification-service — RabbitMQ consumers, WhatsApp service
23. All *.test.ts unit tests for every use case
24. docs/api.md (OpenAPI YAML)
25. docs/architecture.md
26. All docs/adr/ADR-00*.md files
27. README.md (root)

Begin generating all files now. For each file output:
// FILE: <relative path from repo root>
<complete file content>

Do not skip any file. Do not use "// ... rest of implementation" placeholders.
All functions must be fully implemented.