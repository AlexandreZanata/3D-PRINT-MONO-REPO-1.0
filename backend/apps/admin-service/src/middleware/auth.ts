import { readFileSync } from "node:fs";
// @max-lines 200 — this is enforced by the lint pipeline.
import {
  ForbiddenError,
  UnauthorizedError,
  firstForwardedIp,
  matchesAllowedIpEntry,
  normalizeIp,
} from "@repo/utils";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { resolveAdminAllowedIpsRaw } from "../config/resolveAdminAllowedIps.js";

export interface JwtPayload {
  readonly sub: string;
  readonly role: string;
  readonly iat: number;
  readonly exp: number;
}

export function isJwtPayload(verified: unknown): verified is JwtPayload {
  if (typeof verified !== "object" || verified === null) return false;
  if (!("sub" in verified) || typeof verified.sub !== "string") return false;
  if (!("role" in verified) || typeof verified.role !== "string") return false;
  if (!("iat" in verified) || typeof verified.iat !== "number") return false;
  if (!("exp" in verified) || typeof verified.exp !== "number") return false;
  return Number.isFinite(verified.iat) && Number.isFinite(verified.exp);
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
    const verified = jwt.verify(token, getPublicKey(), { algorithms: ["RS256"] });
    if (!isJwtPayload(verified)) {
      next(new UnauthorizedError("Invalid or expired token", "INVALID_TOKEN"));
      return;
    }
    res.locals.jwtPayload = verified;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token", "INVALID_TOKEN"));
  }
}

const ADMIN_ROLES = new Set<string>(["admin", "super_admin"]);

/** Express may expose a full X-Forwarded-For chain; allowlist uses the leftmost client IP. */
function effectiveClientIp(req: Request): string {
  const raw = req.ip?.length ? req.ip : (req.socket.remoteAddress ?? "");
  return firstForwardedIp(raw);
}

/** Requires an admin JWT role. Must follow requireAuth. */
export function requireAdmin(_req: Request, res: Response, next: NextFunction): void {
  const payload = res.locals.jwtPayload;
  if (!isJwtPayload(payload) || !ADMIN_ROLES.has(payload.role)) {
    next(new ForbiddenError("Admin role required", "FORBIDDEN"));
    return;
  }
  next();
}

/** Checks IP allowlist from ADMIN_ALLOWED_IPS env var (exact IPs or IPv4 CIDR, e.g. 172.16.0.0/12). */
export function requireAllowedIp(req: Request, _res: Response, next: NextFunction): void {
  const allowedRaw = resolveAdminAllowedIpsRaw(process.env);
  const entries = allowedRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const rawIp = effectiveClientIp(req);

  const allowed = entries.some((entry) => matchesAllowedIpEntry(rawIp, entry));
  if (!allowed) {
    next(new ForbiddenError(`IP ${normalizeIp(rawIp)} not allowed`, "IP_NOT_ALLOWED"));
    return;
  }
  next();
}
