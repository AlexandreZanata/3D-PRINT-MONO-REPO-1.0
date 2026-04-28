// @max-lines 200 — this is enforced by the lint pipeline.
import type { NextFunction, Request, Response } from "express";
import type { AppLogger } from "../logger.js";

/**
 * Anonymises the last octet of an IPv4 address.
 * IPv6 addresses are returned unchanged.
 * Example: "192.168.1.42" → "192.168.1.0"
 */
export function anonymiseIp(ip: string): string {
  const v4 = /^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/;
  const match = v4.exec(ip);
  if (match?.[1] !== undefined) {
    return `${match[1]}.0`;
  }
  return ip;
}

/**
 * Express middleware that logs every HTTP request with:
 * method, path, statusCode, durationMs, anonymised IP.
 * Reads correlationId from `res.locals["correlationId"]` if set.
 */
export function requestLogger(logger: AppLogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startMs = Date.now();
    const ip = anonymiseIp(req.ip ?? req.socket.remoteAddress ?? "unknown");

    res.on("finish", () => {
      const correlationId = res.locals["correlationId"] as string | undefined;
      const log = correlationId ? logger.child({ correlationId }) : logger;

      log.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - startMs,
        ip,
      }, "http request");
    });

    next();
  };
}
