// @max-lines 200 — this is enforced by the lint pipeline.

/**
 * Redis key builders following the naming convention:
 * snake_case with colon namespacing.
 */

export function sessionKey(adminId: string): string {
  return `session:admin:${adminId}`;
}

export function refreshFamilyKey(familyId: string): string {
  return `refresh_family:${familyId}`;
}

export function productCacheKey(productId: string): string {
  return `product:cache:${productId}`;
}

export function productListCacheKey(): string {
  return "product:list:cache";
}

export function rateLimitKey(ip: string, endpoint: string): string {
  return `rate_limit:${ip}:${endpoint}`;
}

export function sseSubscribersKey(): string {
  return "sse:subscribers";
}
