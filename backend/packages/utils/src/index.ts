// @max-lines 200 — this is enforced by the lint pipeline.
export { type Result, ok, err } from "./result.js";
export { createLogger, type AppLogger } from "./logger.js";
export {
  AppError,
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InfraError,
} from "./errors/index.js";
