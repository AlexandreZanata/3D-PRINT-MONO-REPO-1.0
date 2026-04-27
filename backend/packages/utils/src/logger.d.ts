import type { Logger } from "pino";
export type AppLogger = Logger;
/**
 * Creates a Pino logger bound to a specific service name.
 * Every log entry includes `service` and `correlationId` fields.
 * Secrets matching /password|secret|token|key/i are redacted automatically.
 */
export declare function createLogger(service: string): AppLogger;
//# sourceMappingURL=logger.d.ts.map