import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { Request, Response } from "express";

/**
 * Creates a simple reverse-proxy handler that forwards the request to a
 * downstream service URL, preserving method, headers, and body.
 * The X-Correlation-ID header is forwarded automatically.
 */
export function createProxy(targetBase: string) {
  return (req: Request, res: Response): void => {
    const target = new URL(req.url, targetBase);
    const isHttps = target.protocol === "https:";
    const transport = isHttps ? https : http;

    const correlationId = res.locals.correlationId as string | undefined;

    const options: http.RequestOptions = {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: target.pathname + target.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host,
        ...(correlationId ? { "x-correlation-id": correlationId } : {}),
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

    req.pipe(proxyReq, { end: true });
  };
}
