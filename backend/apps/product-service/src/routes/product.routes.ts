// @max-lines 200 — this is enforced by the lint pipeline.
import { Router } from "express";
import type { ProductController } from "../controllers/ProductController.js";
import type { SseController } from "../controllers/SseController.js";

/**
 * Mounts public product routes onto a Router.
 * All mutations (create/update/delete) are handled by admin-service.
 * Public: GET /  GET /:id  GET /events  GET /:id/whatsapp
 */
export function buildProductRouter(productCtrl: ProductController, sseCtrl: SseController): Router {
  const router = Router();

  router.get("/events", sseCtrl.handle);
  router.get("/", productCtrl.list);
  router.get("/:id/whatsapp", productCtrl.whatsApp);
  router.get("/:id", productCtrl.getById);

  return router;
}
