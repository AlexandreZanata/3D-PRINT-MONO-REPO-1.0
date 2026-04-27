# @repo/domain

Core domain model: entities, value objects, domain events, and repository interfaces.

## Purpose

Contains all business rules and domain concepts. Has **zero external npm dependencies**
— only Node.js built-ins are allowed. Everything else in the monorepo depends on this
package, never the other way around.

## Public API

### Entities
- `Product` — product aggregate root
- `Admin` — admin user entity

### Value Objects
- `PriceVO` — validated non-negative price
- `WhatsAppNumberVO` — validated E.164 phone number
- `EmailVO` — validated email address

### Domain Events
- `ProductCreatedEvent`
- `ProductUpdatedEvent`
- `ProductDeletedEvent`

### Repository Interfaces
- `IProductRepository`
- `IAdminRepository`
- `IRefreshTokenRepository`
- `IAuditLogRepository`

### Other Interfaces
- `QueuePublisher`
- `QueueConsumer`
- `RedisClient`
- `DomainEvent`

## How to run tests

```bash
pnpm --filter @repo/domain test
```

## Dependencies map

No `@repo/*` dependencies — this package is the dependency root.
