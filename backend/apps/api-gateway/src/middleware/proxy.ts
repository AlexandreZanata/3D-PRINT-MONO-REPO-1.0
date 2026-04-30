import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { Request, Response } from "express";
import { withAdminUpstreamForwardedFor } from "./admin-proxy-headers.js";
import { resolveProxyBodyMode } from "./resolve-proxy-body-mode.js";

export type CreateProxyOptions = {
  /** When true, sets `X-Forwarded-For` to the gateway TCP peer (for admin-service allowlist). */
  readonly rewriteForwardedForAsGatewayPeer?: boolean;
};

/**
 * Creates a reverse-proxy handler that forwards requests to a downstream service.
 * Uses req.originalUrl to preserve the full path. JSON bodies are re-serialized from
 * `req.body`; `multipart/form-data` is streamed from the incoming request.
 */
export function createProxy(targetBase: string, options?: CreateProxyOptions) {
  return (req: Request, res: Response): void => {
    const target = new URL(req.originalUrl, targetBase);
    const isHttps = target.protocol === "https:";
    const transport = isHttps ? https : http;
    const correlationId =
      typeof res.locals.correlationId === "string" ? res.locals.correlationId : undefined;

    const bodyMode = resolveProxyBodyMode(req.method, req.headers["content-type"], req.body);
    const bodyData = bodyMode === "json-stringify" ? JSON.stringify(req.body) : undefined;

    const incomingHeaders =
      options?.rewriteForwardedForAsGatewayPeer === true
        ? withAdminUpstreamForwardedFor(req.headers, req.socket.remoteAddress ?? undefined)
        : req.headers;

    const reqOpts: http.RequestOptions = {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: target.pathname + target.search,
      method: req.method,
      headers: {
        ...incomingHeaders,
        host: target.host,
        ...(correlationId ? { "x-correlation-id": correlationId } : {}),
        ...(bodyData ? { "content-length": String(Buffer.byteLength(bodyData)) } : {}),
      },
    };

    const proxyReq = transport.request(reqOpts, (proxyRes) => {
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

    if (bodyMode === "multipart-pipe") {
      req.pipe(proxyReq);
      return;
    }
    if (bodyData !== undefined) {
      proxyReq.write(bodyData);
      proxyReq.end();
      return;
    }
    proxyReq.end();
  };
}
