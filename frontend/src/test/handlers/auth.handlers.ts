import { http, HttpResponse } from "msw";

const BASE = "http://localhost:3000";

// Minimal valid JWT with payload { sub: "admin-1", role: "admin" }
const MOCK_ACCESS_TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." +
  btoa(JSON.stringify({ sub: "admin-1", role: "admin", iat: 1700000000, exp: 9999999999 }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "") +
  ".fakesig";

/**
 * MSW handlers for auth endpoints.
 * Mirrors the OpenAPI spec in backend/docs/api.md exactly.
 */
export const authHandlers = [
  http.post(`${BASE}/api/v1/auth/login`, () =>
    HttpResponse.json({
      success: true,
      data: { accessToken: MOCK_ACCESS_TOKEN, refreshToken: "mock-refresh-token" },
    }),
  ),

  http.post(`${BASE}/api/v1/auth/refresh`, () =>
    HttpResponse.json({
      success: true,
      data: { accessToken: MOCK_ACCESS_TOKEN, refreshToken: "mock-refresh-token-2" },
    }),
  ),

  http.post(`${BASE}/api/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),
];
