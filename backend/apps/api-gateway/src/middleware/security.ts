// @max-lines 200 — this is enforced by the lint pipeline.
import type { Application } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

/**
 * Applies Helmet security headers to the Express app.
 */
export function applyHelmet(app: Application): void {
  app.use(
    helmet({
      contentSecurityPolicy: true,
      hsts: true,
      noSniff: true,
      frameguard: { action: "deny" },
      xssFilter: true,
    }),
  );
}

/** 100 req/min for public endpoints. */
export const publicRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
});

/** 10 req/min for auth endpoints. */
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
});

/** 30 req/min for admin endpoints. */
export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
});
