import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { Request, Response } from "express";

/**
 * Creates a reverse-proxy handler that forwards requests to a downstream service.
 * Uses req.originalUrl to preserve the full path. For POST/PUT/PATCH, serializes
 * req.body back to JSON (since express.json() already consumed the stream).
 */
export function createProxy(targetBase: string) {
  return (req: Request, res: Response): void => {
    const target = new URL(req.originalUrl, targetBase);
    const isHttps = target.protocol === "https:";
    const transport = isHttps ? https : http;
    const correlationId = res.locals.correlationId as string | undefined;

    const hasBody = ["POST", "PUT", "PATCH"].includes(req.method);
    const bodyData = hasBody && req.body ? JSON.stringify(req.body) : undefined;

    const options: http.RequestOptions = {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: target.pathname + target.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host,
        ...(correlationId ? { "x-correlation-id": correlationId } : {}),
        ...(bodyData ? { "content-length": Buffer.byteLength(bodyData) } : {}),
      },
    };

    const proxyReq = transport.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", () => {
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: { code: "BAD_GATEWAY", message: "Upstream service unavailable" },
        });
      }
    });

    if (bodyData) {
      proxyReq.write(bodyData);
      proxyReq.end();
    } else {
      proxyReq.end();
    }
  };
}
