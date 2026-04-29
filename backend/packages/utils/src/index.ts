// @max-lines 200 — this is enforced by the lint pipeline.
export { type Result, ok, err } from "./result.js";
export { createLogger, withCorrelation, type AppLogger } from "./logger.js";
export {
  AppError,
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InfraError,
} from "./errors/index.js";
export {
  requestLogger,
  anonymiseIp,
  createHealthHandler,
  deriveOverallStatus,
  correlationIdMiddleware,
  createErrorHandler,
  CORRELATION_HEADER,
} from "./http/index.js";
export type {
  HealthStatus,
  HealthChecks,
  HealthResponse,
  HealthCheckDeps,
  CheckFn,
  ApiErrorBody,
} from "./http/index.js";
export { normalizeIp } from "./net/normalize-ip.js";
export { matchesAllowedIpEntry } from "./net/allowed-ip-entry.js";
export { firstForwardedIp } from "./net/first-forwarded-ip.js";
