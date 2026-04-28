# API Layer Reference

All HTTP communication lives in `src/api/`. No component may call `fetch`, `axios`, or `EventSource` directly.

---

## HTTP client (`src/api/httpClient.ts`)

A singleton Axios instance configured with:

- `baseURL`: `VITE_API_BASE_URL` (default: `http://localhost:3000`)
- `withCredentials: true` — sends the HttpOnly refresh-token cookie automatically
- `Content-Type: application/json`

### Initialization

`initHttpClient(deps)` must be called once at app startup (in `AppProviders`). It wires the auth store into the interceptors.

```typescript
initHttpClient({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getCsrfToken:   () => useAuthStore.getState().csrfToken,
  setAccessToken: (token) => useAuthStore.getState().setAccessToken(token),
  clearSession:   () => useAuthStore.getState().clearSession(),
});
```

### Request interceptor

1. Attaches `Authorization: Bearer <accessToken>` if a token exists
2. Attaches `X-CSRF-Token` for admin mutations (`POST/PUT/PATCH/DELETE /api/v1/admin/*`)
3. Generates a `X-Correlation-ID` (UUIDv4) per request

### Response interceptor

On `401 Unauthorized`:
1. Calls `POST /api/v1/auth/refresh` (cookie sent automatically)
2. On success: updates `accessToken` in store, retries the original request once
3. On failure: calls `clearSession()` + redirects to `/`

---

## Endpoints (`src/api/endpoints.ts`)

All API path constants. No magic strings anywhere else in the codebase.

```typescript
ENDPOINTS.PRODUCTS_LIST          // "/api/v1/products"
ENDPOINTS.PRODUCT_BY_ID(id)      // "/api/v1/products/:id"
ENDPOINTS.PRODUCT_WHATSAPP(id)   // "/api/v1/products/:id/whatsapp"
ENDPOINTS.PRODUCTS_EVENTS        // "/api/v1/products/events"
ENDPOINTS.AUTH_LOGIN             // "/api/v1/auth/login"
ENDPOINTS.AUTH_REFRESH           // "/api/v1/auth/refresh"
ENDPOINTS.AUTH_LOGOUT            // "/api/v1/auth/logout"
ENDPOINTS.ADMIN_PRODUCTS_LIST    // "/api/v1/admin/products"
ENDPOINTS.ADMIN_PRODUCT_CREATE   // "/api/v1/admin/products"
ENDPOINTS.ADMIN_PRODUCT_UPDATE(id) // "/api/v1/admin/products/:id"
ENDPOINTS.ADMIN_PRODUCT_DELETE(id) // "/api/v1/admin/products/:id"
ENDPOINTS.ADMIN_AUDIT_LOGS       // "/api/v1/admin/audit-logs"
```

---

## API functions

Each file calls the relevant facade before returning data.

| File | Functions |
|---|---|
| `products.api.ts` | `fetchProducts`, `fetchProductById`, `fetchWhatsappLink` |
| `auth.api.ts` | `login`, `refreshToken`, `logout` |
| `admin.api.ts` | `adminFetchProducts`, `adminCreateProduct`, `adminUpdateProduct`, `adminDeleteProduct`, `adminFetchAuditLogs` |

---

## SSE (`src/api/sse.ts`)

`openSSEConnection(onEvent)` opens an `EventSource` to `VITE_SSE_URL`. Returns a cleanup function.

```typescript
const cleanup = openSSEConnection((eventType, payload) => {
  // handle product.created | product.updated | product.deleted
});
// later:
cleanup(); // closes the EventSource
```

**Note:** `EventSource` does not support custom headers. The SSE endpoint is public by design — no auth token is sent.
