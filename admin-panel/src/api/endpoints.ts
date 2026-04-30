/**
 * API path constants — aligned with the storefront [frontend/src/api/endpoints.ts](frontend/src/api/endpoints.ts).
 */
export const ENDPOINTS = {
  AUTH_LOGIN: "/api/v1/auth/login",
  AUTH_REFRESH: "/api/v1/auth/refresh",
  AUTH_LOGOUT: "/api/v1/auth/logout",

  ADMIN_PRODUCTS_LIST: "/api/v1/admin/products",
  ADMIN_PRODUCT_CREATE: "/api/v1/admin/products",
  ADMIN_PRODUCT_UPDATE: (id: string) => `/api/v1/admin/products/${id}`,
  ADMIN_PRODUCT_DELETE: (id: string) => `/api/v1/admin/products/${id}`,
  ADMIN_PRODUCT_BY_ID: (id: string) => `/api/v1/admin/products/${id}`,

  ADMIN_UPLOAD: "/api/v1/admin/uploads",

  ADMIN_AUDIT_LOGS: "/api/v1/admin/audit-logs",
  ADMIN_SITE_SETTINGS: "/api/v1/admin/site-settings",
} as const;
