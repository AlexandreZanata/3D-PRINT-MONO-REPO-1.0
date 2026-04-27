# @repo/cache-adapter

Redis adapter using ioredis, implementing the `RedisClient` interface from `@repo/domain`.

## Purpose

Wraps ioredis with typed, Result-returning methods. Enforces the key naming
convention defined in the architecture spec (colon-namespaced, snake_case).

## Public API

### Client
- `createRedisClient(config)` — returns an `IRedisClient` instance

### Key builders (pure functions)
- `sessionKey(adminId)` → `session:admin:{adminId}`
- `refreshFamilyKey(familyId)` → `refresh_family:{familyId}`
- `productCacheKey(productId)` → `product:cache:{productId}`
- `productListCacheKey()` → `product:list:cache`
- `rateLimitKey(ip, endpoint)` → `rate_limit:{ip}:{endpoint}`

## How to run tests

```bash
pnpm --filter @repo/cache-adapter test
```

## Dependencies map

| Package | Reason |
|---|---|
| `@repo/domain` | `RedisClient` interface |
| `@repo/utils` | InfraError, Result type |
