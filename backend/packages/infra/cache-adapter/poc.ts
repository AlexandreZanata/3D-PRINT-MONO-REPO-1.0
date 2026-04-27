// @max-lines 200 — this is enforced by the lint pipeline.
// poc.ts — minimum working usage of @repo/cache-adapter
// Run: npx tsx poc.ts (requires Redis running on localhost:6379)

import { IoRedisClient, productCacheKey, sessionKey } from "./src/index.js";

async function main() {
  const redis = new IoRedisClient({
    host: process.env["REDIS_HOST"] ?? "localhost",
    port: Number(process.env["REDIS_PORT"] ?? 6379),
    password: process.env["REDIS_PASSWORD"],
  });

  // ── Set and get with TTL ──────────────────────────────────────────────────
  const key = productCacheKey("product-123");
  const setResult = await redis.set(key, JSON.stringify({ name: "Vase", price: 49.99 }), 300);
  if (!setResult.ok) {
    throw setResult.error;
  }

  const getResult = await redis.get(key);
  if (getResult.ok && getResult.value) {
    const product = JSON.parse(getResult.value);
    // biome-ignore lint/suspicious/noConsole: POC demonstration
    console.log("Cached product:", product);
  }

  // ── Session hash ──────────────────────────────────────────────────────────
  const adminKey = sessionKey("admin-456");
  await redis.hset(adminKey, "role", "admin");
  await redis.expire(adminKey, 1800); // 30 min

  const roleResult = await redis.hget(adminKey, "role");
  if (roleResult.ok) {
    // biome-ignore lint/suspicious/noConsole: POC demonstration
    console.log("Admin role:", roleResult.value);
  }

  // ── Sorted set (SSE subscribers) ──────────────────────────────────────────
  await redis.zadd("sse:subscribers", Date.now(), "conn-789");
  const countResult = await redis.zcard("sse:subscribers");
  if (countResult.ok) {
    // biome-ignore lint/suspicious/noConsole: POC demonstration
    console.log("Active SSE connections:", countResult.value);
  }

  await redis.disconnect();
}

main().catch((e) => {
  // biome-ignore lint/suspicious/noConsole: POC error handling
  console.error("POC failed:", e);
  process.exit(1);
});
