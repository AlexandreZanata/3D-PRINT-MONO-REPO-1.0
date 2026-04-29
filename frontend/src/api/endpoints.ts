/**
 * All API path constants. No magic strings anywhere else in the codebase.
 * Every path must match the OpenAPI spec in backend/docs/api.md exactly.
 */
export const ENDPOINTS = {
  // ── Public products ──────────────────────────────────────────────────────
  PRODUCTS_LIST:        "/api/v1/products",
  PRODUCT_BY_ID:        (id: string) => `/api/v1/products/${id}`,
  PRODUCT_WHATSAPP:     (id: string) => `/api/v1/products/${id}/whatsapp`,
  PRODUCTS_EVENTS:      "/api/v1/products/events",

  // ── Auth ─────────────────────────────────────────────────────────────────
  AUTH_LOGIN:           "/api/v1/auth/login",
  AUTH_REFRESH:         "/api/v1/auth/refresh",
  AUTH_LOGOUT:          "/api/v1/auth/logout",

  // ── Admin products ────────────────────────────────────────────────────────
  ADMIN_PRODUCTS_LIST:  "/api/v1/admin/products",
  ADMIN_PRODUCT_CREATE: "/api/v1/admin/products",
  ADMIN_PRODUCT_UPDATE: (id: string) => `/api/v1/admin/products/${id}`,
  ADMIN_PRODUCT_DELETE: (id: string) => `/api/v1/admin/products/${id}`,

  // ── Admin audit logs ──────────────────────────────────────────────────────
  ADMIN_AUDIT_LOGS:     "/api/v1/admin/audit-logs",

  // ── Admin site settings ───────────────────────────────────────────────────
  ADMIN_SITE_SETTINGS:  "/api/v1/admin/site-settings",

  // ── Public site settings ──────────────────────────────────────────────────
  SITE_SETTINGS:        "/api/v1/site-settings",
} as const;
