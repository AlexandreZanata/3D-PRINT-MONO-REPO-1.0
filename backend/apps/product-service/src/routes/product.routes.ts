// @max-lines 200 — this is enforced by the lint pipeline.
import { Router } from "express";
import type { ProductController } from "../controllers/ProductController.js";
import type { SiteSettingsController } from "../controllers/SiteSettingsController.js";
import type { SseController } from "../controllers/SseController.js";

export function buildProductRouter(
  productCtrl: ProductController,
  _siteSettingsCtrl: SiteSettingsController,
  sseCtrl: SseController,
): Router {
  const router = Router();

  router.get("/events", sseCtrl.handle);
  router.get("/", productCtrl.list);
  router.get("/:id/whatsapp", productCtrl.whatsApp);
  router.get("/:id", productCtrl.getById);

  return router;
}

/** Builds a separate router for site-settings (public, no auth). */
export function buildSiteSettingsRouter(ctrl: SiteSettingsController): Router {
  const router = Router();
  router.get("/", ctrl.get);
  return router;
}
