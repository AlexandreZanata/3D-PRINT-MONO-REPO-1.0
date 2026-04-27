// @max-lines 200 — this is enforced by the lint pipeline.
import type { RedisClient } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import { Redis, type RedisOptions } from "ioredis";

export class IoRedisClient implements RedisClient {
  private readonly client: Redis;

  constructor(options: RedisOptions) {
    this.client = new Redis(options);
  }

  async get(key: string): Promise<Result<string | null, InfraError>> {
    try {
      const value = await this.client.get(key);
      return ok(value);
    } catch (e) {
      return err(new InfraError(`Redis GET failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<Result<void, InfraError>> {
    try {
      if (ttlSeconds !== undefined) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis SET failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async del(key: string): Promise<Result<void, InfraError>> {
    try {
      await this.client.del(key);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis DEL failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async sadd(key: string, ...members: string[]): Promise<Result<void, InfraError>> {
    try {
      await this.client.sadd(key, ...members);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis SADD failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async srem(key: string, ...members: string[]): Promise<Result<void, InfraError>> {
    try {
      await this.client.srem(key, ...members);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis SREM failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async smembers(key: string): Promise<Result<string[], InfraError>> {
    try {
      const members = await this.client.smembers(key);
      return ok(members);
    } catch (e) {
      return err(new InfraError(`Redis SMEMBERS failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<Result<void, InfraError>> {
    try {
      await this.client.expire(key, ttlSeconds);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis EXPIRE failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async hset(key: string, field: string, value: string): Promise<Result<void, InfraError>> {
    try {
      await this.client.hset(key, field, value);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis HSET failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async hget(key: string, field: string): Promise<Result<string | null, InfraError>> {
    try {
      const value = await this.client.hget(key, field);
      return ok(value);
    } catch (e) {
      return err(new InfraError(`Redis HGET failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async zadd(key: string, score: number, member: string): Promise<Result<void, InfraError>> {
    try {
      await this.client.zadd(key, score, member);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis ZADD failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async zrem(key: string, member: string): Promise<Result<void, InfraError>> {
    try {
      await this.client.zrem(key, member);
      return ok(undefined);
    } catch (e) {
      return err(new InfraError(`Redis ZREM failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async zcard(key: string): Promise<Result<number, InfraError>> {
    try {
      const count = await this.client.zcard(key);
      return ok(count);
    } catch (e) {
      return err(new InfraError(`Redis ZCARD failed for key ${key}`, toError(e), "REDIS_ERROR"));
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
