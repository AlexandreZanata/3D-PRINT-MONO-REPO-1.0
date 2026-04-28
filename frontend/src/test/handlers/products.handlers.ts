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

/**
 * MSW handlers for public product endpoints.
 * Mirrors the OpenAPI spec in backend/docs/api.md exactly.
 */
export const productHandlers = [
  http.get(`${BASE}/api/v1/products`, () =>
    HttpResponse.json({
      success: true,
      data: [mockProduct],
      meta: { page: 1, limit: 20, total: 1 },
    }),
  ),

  http.get(`${BASE}/api/v1/products/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockProduct, id: String(params["id"]) },
    }),
  ),

  http.get(`${BASE}/api/v1/products/:id/whatsapp`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { url: `https://wa.me/5511999999999?text=Hi%20about%20${String(params["id"])}` },
    }),
  ),
];
