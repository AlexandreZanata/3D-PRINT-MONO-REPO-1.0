// @max-lines 200 — this is enforced by the lint pipeline.
export { requestLogger, anonymiseIp } from "./request-logger.js";
export {
  createHealthHandler,
  deriveOverallStatus,
} from "./health-handler.js";
export type {
  HealthStatus,
  HealthChecks,
  HealthResponse,
  HealthCheckDeps,
  CheckFn,
} from "./health-handler.js";
export { correlationIdMiddleware, CORRELATION_HEADER } from "./correlation-id.js";
export { createErrorHandler } from "./error-handler.js";
export type { ApiErrorBody } from "./error-handler.js";
