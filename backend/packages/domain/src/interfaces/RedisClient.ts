// @max-lines 200 — this is enforced by the lint pipeline.
import type { InfraError } from "../common/InfraError.js";
import type { Result } from "../common/Result.js";

export interface RedisClient {
  get(key: string): Promise<Result<string | null, InfraError>>;
  set(key: string, value: string, ttlSeconds?: number): Promise<Result<void, InfraError>>;
  del(key: string): Promise<Result<void, InfraError>>;
  sadd(key: string, ...members: string[]): Promise<Result<void, InfraError>>;
  srem(key: string, ...members: string[]): Promise<Result<void, InfraError>>;
  smembers(key: string): Promise<Result<string[], InfraError>>;
  expire(key: string, ttlSeconds: number): Promise<Result<void, InfraError>>;
  hset(key: string, field: string, value: string): Promise<Result<void, InfraError>>;
  hget(key: string, field: string): Promise<Result<string | null, InfraError>>;
  zadd(key: string, score: number, member: string): Promise<Result<void, InfraError>>;
  zrem(key: string, member: string): Promise<Result<void, InfraError>>;
  zcard(key: string): Promise<Result<number, InfraError>>;
}
