// @max-lines 200 — this is enforced by the lint pipeline.
// poc.ts — minimum working usage of @repo/utils (logger + http utilities)
// Run: npx tsx poc.ts
// Then: curl http://localhost:3200/health  and  curl http://localhost:3200/products

import express from "express";
import { NotFoundError } from "./src/errors/index.js";
import {
  correlationIdMiddleware,
  createErrorHandler,
  createHealthHandler,
  requestLogger,
} from "./src/http/index.js";
import { createLogger, withCorrelation } from "./src/logger.js";
import { matchesAllowedIpEntry } from "./src/net/allowed-ip-entry.js";
import { normalizeIp } from "./src/net/normalize-ip.js";

const logger = createLogger("poc");
const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(correlationIdMiddleware);
app.use(requestLogger(logger));

// ── Health endpoint ───────────────────────────────────────────────────────────
app.get(
  "/health",
  createHealthHandler({
    db: async () => "ok",
    redis: async () => "ok",
    rabbitmq: async () => "degraded", // Simulates a degraded dependency
    version: "1.0.0",
  }),
);

// ── Demo: correlation ID in logs ──────────────────────────────────────────────
app.get("/products", (_req, res) => {
  const correlationId = res.locals.correlationId as string;
  const log = withCorrelation(logger, correlationId);
  log.info("listing products");
  res.json({ success: true, data: [] });
});

// ── Demo: AppError mapping ────────────────────────────────────────────────────
app.get("/products/:id", (_req, _res, next) => {
  next(new NotFoundError("Product not found", "PRODUCT_NOT_FOUND"));
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(createErrorHandler(logger));

app.listen(3200, () => {
  logger.info("POC server listening on http://localhost:3200");
  logger.info("Try: curl http://localhost:3200/health");
  logger.info("Try: curl http://localhost:3200/products/missing");
  logger.info(
    {
      normalized: normalizeIp("::ffff:127.0.0.1"),
      dockerPeerOk: matchesAllowedIpEntry("172.18.0.9", "172.16.0.0/12"),
    },
    "net helpers example",
  );
});
