# @repo/contracts

Zod schemas, inferred TypeScript types, and shared API interfaces.

## Purpose

Single source of truth for all request/response shapes. Consumed by controllers
for input validation and by the application layer for DTO typing.

## Public API

### Schemas
- `CreateProductSchema` / `CreateProductDTO`
- `UpdateProductSchema` / `UpdateProductDTO`
- `ListProductsQuerySchema` / `ListProductsQueryDTO`
- `LoginSchema` / `LoginDTO`
- `RefreshTokenSchema` / `RefreshTokenDTO`
- `PaginationSchema` / `PaginationDTO`

### Response types
- `ApiSuccess<T>`
- `ApiError`
- `ApiResponse<T>`
- `PaginatedMeta`

## How to run tests

```bash
pnpm --filter @repo/contracts test
```

## Dependencies map

| Package | Reason |
|---|---|
| `zod` | Schema definition and inference |
