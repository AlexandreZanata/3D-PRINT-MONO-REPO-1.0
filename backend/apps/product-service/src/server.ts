// @max-lines 200 — this is enforced by the lint pipeline.
import {
  correlationIdMiddleware,
  createErrorHandler,
  createHealthHandler,
  requestLogger,
} from "@repo/utils";
import type { HealthCheckDeps } from "@repo/utils";
import { createLogger } from "@repo/utils";
import express from "express";
import type { CompositionRoot } from "./composition-root.js";
import { buildProductRouter } from "./routes/product.routes.js";

const logger = createLogger("product-service");

export function buildServer(root: CompositionRoot): express.Application {
  const app = express();

  app.use(express.json());
  app.use(correlationIdMiddleware);
  app.use(requestLogger(logger));

  // ── Health ────────────────────────────────────────────────────────────────
  const healthDeps: HealthCheckDeps = {
    db: async () => "ok",
    redis: async () => "ok",
    rabbitmq: async () => "ok",
    version: process.env.npm_package_version ?? "0.0.0",
  };
  app.get("/health", createHealthHandler(healthDeps));

  // ── Routes ────────────────────────────────────────────────────────────────
  const productRouter = buildProductRouter(root.productController, root.sseController);
  app.use("/api/v1/products", productRouter);

  // ── Error handler (must be last) ──────────────────────────────────────────
  app.use(createErrorHandler(logger));

  return app;
}
