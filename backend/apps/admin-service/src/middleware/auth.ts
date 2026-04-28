import { readFileSync } from "node:fs";
// @max-lines 200 — this is enforced by the lint pipeline.
import { ForbiddenError, UnauthorizedError } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  readonly sub: string;
  readonly role: string;
  readonly iat: number;
  readonly exp: number;
}

let _publicKey: string | null = null;

function getPublicKey(): string {
  if (!_publicKey) {
    const path = process.env.JWT_PUBLIC_KEY_PATH;
    if (!path) throw new Error("JWT_PUBLIC_KEY_PATH is not set");
    _publicKey = readFileSync(path, "utf-8");
  }
  return _publicKey;
}

/** Verifies Bearer JWT and attaches payload to res.locals. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing authorization header", "MISSING_TOKEN"));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getPublicKey(), { algorithms: ["RS256"] }) as JwtPayload;
    res.locals.jwtPayload = payload;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token", "INVALID_TOKEN"));
  }
}

/** Requires the "admin" role. Must follow requireAuth. */
export function requireAdmin(_req: Request, res: Response, next: NextFunction): void {
  const payload = res.locals.jwtPayload as JwtPayload | undefined;
  if (!payload || payload.role !== "admin") {
    next(new ForbiddenError("Admin role required", "FORBIDDEN"));
    return;
  }
  next();
}

/** Checks IP allowlist from ADMIN_ALLOWED_IPS env var. */
export function requireAllowedIp(req: Request, _res: Response, next: NextFunction): void {
  const allowedRaw = process.env.ADMIN_ALLOWED_IPS ?? "127.0.0.1,::1";
  const allowed = allowedRaw.split(",").map((ip) => ip.trim());
  const clientIp = req.ip ?? "";

  if (!allowed.includes(clientIp)) {
    next(new ForbiddenError(`IP ${clientIp} not allowed`, "IP_NOT_ALLOWED"));
    return;
  }
  next();
}
