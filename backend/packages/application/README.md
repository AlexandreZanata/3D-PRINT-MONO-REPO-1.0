# @repo/application

Use cases, facades, services, and DTOs that orchestrate domain operations.

## Purpose

Implements all application-layer business logic. Each use case encapsulates a
single operation and returns `Result<T, AppError>`. Facades coordinate multiple
use cases for a single HTTP request.

## Public API

### Product Use Cases
- `ListProductsUseCase`
- `GetProductByIdUseCase`
- `CreateProductUseCase`
- `UpdateProductUseCase`
- `DeleteProductUseCase`

### Auth Use Cases
- `LoginUseCase`
- `RefreshTokenUseCase`
- `LogoutUseCase`

### Facades
- `ProductFacade`
- `AuthFacade`

### Services
- `CacheService`
- `WhatsAppLinkService`

## How to run tests

```bash
pnpm --filter @repo/application test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/domain` | Entities, repository interfaces, domain events |
| `@repo/contracts` | Zod-derived DTOs and API types |
