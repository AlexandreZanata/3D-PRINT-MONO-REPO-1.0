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
import { createProxy } from "./middleware/proxy.js";
import {
  adminRateLimit,
  applyHelmet,
  authRateLimit,
  publicRateLimit,
} from "./middleware/security.js";

const logger = createLogger("api-gateway");

function getServiceUrl(envKey: string, fallback: string): string {
  return process.env[envKey] ?? fallback;
}

export function buildServer(): express.Application {
  const app = express();

  // ── Security ──────────────────────────────────────────────────────────────
  applyHelmet(app);
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

  // ── Upstream URLs ─────────────────────────────────────────────────────────
  const productServiceUrl = getServiceUrl("PRODUCT_SERVICE_URL", "http://localhost:3001");
  const adminServiceUrl = getServiceUrl("ADMIN_SERVICE_URL", "http://localhost:3002");

  // ── Public product routes ─────────────────────────────────────────────────
  app.use("/api/v1/products", publicRateLimit, createProxy(productServiceUrl));

  // ── Auth routes ───────────────────────────────────────────────────────────
  app.use("/api/v1/auth", authRateLimit, createProxy(adminServiceUrl));

  // ── Admin routes ──────────────────────────────────────────────────────────
  app.use("/api/v1/admin", adminRateLimit, createProxy(adminServiceUrl));

  // ── Error handler ─────────────────────────────────────────────────────────
  app.use(createErrorHandler(logger));

  return app;
}
