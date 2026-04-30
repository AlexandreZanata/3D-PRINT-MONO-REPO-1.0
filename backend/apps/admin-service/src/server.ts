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

function trustProxyHops(): number {
  const raw = process.env.ADMIN_TRUST_PROXY_HOPS ?? "1";
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    return 1;
  }
  return n;
}

export function buildServer(root: CompositionRoot): express.Application {
  const app = express();

  app.set("trust proxy", trustProxyHops());

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

  app.use(
    "/api/v1/uploads",
    express.static(root.uploadDirAbs, { fallthrough: false, maxAge: "1d", index: false }),
  );

  const apiRouter = buildAdminRouter(
    root.authController,
    root.productController,
    root.siteSettingsController,
    root.auditLogController,
    root.uploadFileMiddleware,
    root.uploadController,
  );
  app.use("/api/v1", apiRouter);

  app.use(createErrorHandler(logger));

  return app;
}
