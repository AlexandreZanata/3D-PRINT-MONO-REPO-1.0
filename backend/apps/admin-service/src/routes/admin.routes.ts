// @max-lines 200 — this is enforced by the lint pipeline.
import { Router } from "express";
import type { AdminProductController } from "../controllers/AdminProductController.js";
import type { AuditLogController } from "../controllers/AuditLogController.js";
import type { AuthController } from "../controllers/AuthController.js";
import { requireAdmin, requireAllowedIp, requireAuth } from "../middleware/auth.js";

/**
 * Builds the admin service router.
 * Auth routes: /api/v1/auth/*
 * Admin routes: /api/v1/admin/* (require JWT + admin role + IP allowlist)
 */
export function buildAdminRouter(
  authCtrl: AuthController,
  productCtrl: AdminProductController,
  auditCtrl: AuditLogController,
): Router {
  const router = Router();

  // ── Auth ──────────────────────────────────────────────────────────────────
  router.post("/auth/login", authCtrl.login);
  router.post("/auth/refresh", authCtrl.refresh);
  router.post("/auth/logout", authCtrl.logout);

  // ── Admin (protected) ─────────────────────────────────────────────────────
  const adminGuard = [requireAllowedIp, requireAuth, requireAdmin];

  router.get("/admin/products", ...adminGuard, productCtrl.list);
  router.post("/admin/products", ...adminGuard, productCtrl.create);
  router.put("/admin/products/:id", ...adminGuard, productCtrl.update);
  router.delete("/admin/products/:id", ...adminGuard, productCtrl.remove);
  router.get("/admin/audit-logs", ...adminGuard, auditCtrl.list);

  return router;
}
