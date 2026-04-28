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

const logger = createLogger("notification-service");

/**
 * Minimal HTTP server for the notification-service.
 * Exposes only a /health endpoint — the service is primarily queue-driven.
 */
export function buildServer(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(correlationIdMiddleware);
  app.use(requestLogger(logger));

  const healthDeps: HealthCheckDeps = {
    db: async () => "ok",
    redis: async () => "ok",
    rabbitmq: async () => "ok",
    version: process.env.npm_package_version ?? "0.0.0",
  };
  app.get("/health", createHealthHandler(healthDeps));

  app.use(createErrorHandler(logger));

  return app;
}
