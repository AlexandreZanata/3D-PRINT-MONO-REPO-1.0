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
import { buildProductRouter, buildSiteSettingsRouter } from "./routes/product.routes.js";

const logger = createLogger("product-service");

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

  const productRouter = buildProductRouter(
    root.productController,
    root.siteSettingsController,
    root.sseController,
  );
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/site-settings", buildSiteSettingsRouter(root.siteSettingsController));

  app.use(createErrorHandler(logger));

  return app;
}
