// @max-lines 200 — this is enforced by the lint pipeline.
import { Router } from "express";
import type { RequestHandler } from "express";
import type { AdminProductController } from "../controllers/AdminProductController.js";
import type { AdminSiteSettingsController } from "../controllers/AdminSiteSettingsController.js";
import type { AuditLogController } from "../controllers/AuditLogController.js";
import type { AuthController } from "../controllers/AuthController.js";
import type { UploadController } from "../controllers/UploadController.js";
import { requireAdmin, requireAllowedIp, requireAuth } from "../middleware/auth.js";

export function buildAdminRouter(
  authCtrl: AuthController,
  productCtrl: AdminProductController,
  siteSettingsCtrl: AdminSiteSettingsController,
  auditCtrl: AuditLogController,
  uploadFile: RequestHandler,
  uploadCtrl: UploadController,
): Router {
  const router = Router();

  // ── Auth ──────────────────────────────────────────────────────────────────
  router.post("/auth/login", authCtrl.login);
  router.post("/auth/refresh", authCtrl.refresh);
  router.post("/auth/logout", authCtrl.logout);

  // ── Admin (protected) ─────────────────────────────────────────────────────
  const adminGuard = [requireAllowedIp, requireAuth, requireAdmin];

  router.get("/admin/products", ...adminGuard, productCtrl.list);
  router.get("/admin/products/:id", ...adminGuard, productCtrl.getById);
  router.post("/admin/products", ...adminGuard, productCtrl.create);
  router.post("/admin/uploads", ...adminGuard, uploadFile, uploadCtrl.complete);
  router.put("/admin/products/:id", ...adminGuard, productCtrl.update);
  router.delete("/admin/products/:id", ...adminGuard, productCtrl.remove);

  router.get("/admin/site-settings", ...adminGuard, siteSettingsCtrl.get);
  router.put("/admin/site-settings", ...adminGuard, siteSettingsCtrl.update);

  router.get("/admin/audit-logs", ...adminGuard, auditCtrl.list);

  return router;
}
