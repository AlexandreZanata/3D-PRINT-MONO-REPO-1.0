import { http, HttpResponse } from "msw";

const BASE = "http://localhost:3000";

const mockProduct = {
  id: "prod-1",
  name: "Geometric Vase",
  description: "A modern 3D-printed vase",
  price: "49.99",
  stock: "10",
  whatsappNumber: "+5511999999999",
  imageUrl: null,
  isActive: true,
  createdAt: "2026-04-28T00:00:00.000Z",
  updatedAt: "2026-04-28T00:00:00.000Z",
  deletedAt: null,
};

const mockAuditLog = {
  id: "log-1",
  adminId: "admin-1",
  action: "create",
  entity: "product",
  entityId: "prod-1",
  payload: { name: "Vase" },
  ip: "127.0.0.1",
  ua: "Mozilla/5.0",
  createdAt: "2026-04-28T00:00:00.000Z",
};

/**
 * MSW handlers for admin endpoints.
 * Mirrors the OpenAPI spec in backend/docs/api.md exactly.
 */
export const adminHandlers = [
  http.get(`${BASE}/api/v1/admin/products`, () =>
    HttpResponse.json({
      success: true,
      data: [mockProduct],
      meta: { page: 1, limit: 20, total: 1 },
    }),
  ),

  http.post(`${BASE}/api/v1/admin/products`, () =>
    HttpResponse.json({ success: true, data: { ...mockProduct, id: "prod-new" } }, { status: 201 }),
  ),

  http.put(`${BASE}/api/v1/admin/products/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockProduct, id: String(params["id"]) },
    }),
  ),

  http.delete(`${BASE}/api/v1/admin/products/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  http.get(`${BASE}/api/v1/admin/audit-logs`, () =>
    HttpResponse.json({
      success: true,
      data: [mockAuditLog],
      meta: { page: 1, limit: 20, total: 1 },
    }),
  ),
];
