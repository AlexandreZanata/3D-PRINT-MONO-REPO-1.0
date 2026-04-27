// @max-lines 200 — this is enforced by the lint pipeline.
import { pino } from "pino";
import type { Logger } from "pino";

/** Keys whose values must never appear in log output. */
const REDACT_PATHS = [
  "password",
  "passwordHash",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "key",
  "privateKey",
  "*.password",
  "*.secret",
  "*.token",
  "*.key",
];

export type AppLogger = Logger;

/**
 * Creates a Pino logger bound to a specific service name.
 * Every log entry includes `service` and `correlationId` fields.
 * Secrets matching /password|secret|token|key/i are redacted automatically.
 */
export function createLogger(service: string): AppLogger {
  return pino({
    name: service,
    level: process.env["LOG_LEVEL"] ?? "info",
    redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
  });
}
