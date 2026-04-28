// @max-lines 200 — this is enforced by the lint pipeline.
// poc.ts — minimum working usage of @repo/utils (logger + http utilities)
// Run: npx tsx poc.ts
// Then: curl http://localhost:3200/health  and  curl http://localhost:3200/products

import express from "express";
import { createLogger, withCorrelation } from "./src/logger.js";
import {
  correlationIdMiddleware,
  createErrorHandler,
  createHealthHandler,
  requestLogger,
} from "./src/http/index.js";
import { NotFoundError } from "./src/errors/index.js";

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
app.get("/products", (req, res) => {
  const correlationId = res.locals["correlationId"] as string;
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
});
