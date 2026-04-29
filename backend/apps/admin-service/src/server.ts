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
import { buildAdminRouter } from "./routes/admin.routes.js";

const logger = createLogger("admin-service");

export function buildServer(root: CompositionRoot): express.Application {
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

  const apiRouter = buildAdminRouter(
    root.authController,
    root.productController,
    root.siteSettingsController,
    root.auditLogController,
  );
  app.use("/api/v1", apiRouter);

  app.use(createErrorHandler(logger));

  return app;
}
