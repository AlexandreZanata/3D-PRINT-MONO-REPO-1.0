import { randomUUID } from "node:crypto";
import { sseSubscribersKey } from "@repo/cache-adapter";
import type { RedisClient } from "@repo/domain";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { SSEManager } from "@repo/sse-adapter";
import type { AppLogger } from "@repo/utils";
import type { Request, Response } from "express";

/**
 * Handles GET /api/v1/products/events
 * Registers the client as an SSE connection and tracks it in Redis.
 */
export class SseController {
  constructor(
    private readonly sseManager: SSEManager,
    private readonly redis: RedisClient,
    private readonly logger: AppLogger,
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const connectionId = randomUUID();
    const added = this.sseManager.addConnection(connectionId, res);

    if (!added) {
      res.status(503).end("Max connections reached");
      return;
    }

    // Track in Redis sorted set (score = timestamp)
    await this.redis.zadd(sseSubscribersKey(), Date.now(), connectionId);
    this.logger.info({ connectionId }, "SSE client connected");

    req.on("close", async () => {
      this.sseManager.removeConnection(connectionId);
      await this.redis.zrem(sseSubscribersKey(), connectionId);
      this.logger.info({ connectionId }, "SSE client disconnected");
    });
  };
}
