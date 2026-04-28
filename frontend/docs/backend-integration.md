# Backend Integration Checklist

Documents every integration point between the Forma frontend and backend.

---

## 14.1 API contract alignment

Every endpoint called by the frontend references a constant from `src/api/endpoints.ts` and matches the OpenAPI spec in `backend/docs/api.md`.

| Frontend function | Endpoint constant | Backend route |
|---|---|---|
| `fetchProducts` | `ENDPOINTS.PRODUCTS_LIST` | `GET /api/v1/products` |
| `fetchProductById` | `ENDPOINTS.PRODUCT_BY_ID(id)` | `GET /api/v1/products/:id` |
| `fetchWhatsappLink` | `ENDPOINTS.PRODUCT_WHATSAPP(id)` | `GET /api/v1/products/:id/whatsapp` |
| `login` | `ENDPOINTS.AUTH_LOGIN` | `POST /api/v1/auth/login` |
| `refreshToken` | `ENDPOINTS.AUTH_REFRESH` | `POST /api/v1/auth/refresh` |
| `logout` | `ENDPOINTS.AUTH_LOGOUT` | `POST /api/v1/auth/logout` |
| `adminFetchProducts` | `ENDPOINTS.ADMIN_PRODUCTS_LIST` | `GET /api/v1/admin/products` |
| `adminCreateProduct` | `ENDPOINTS.ADMIN_PRODUCT_CREATE` | `POST /api/v1/admin/products` |
| `adminUpdateProduct` | `ENDPOINTS.ADMIN_PRODUCT_UPDATE(id)` | `PUT /api/v1/admin/products/:id` |
| `adminDeleteProduct` | `ENDPOINTS.ADMIN_PRODUCT_DELETE(id)` | `DELETE /api/v1/admin/products/:id` |
| `adminFetchAuditLogs` | `ENDPOINTS.ADMIN_AUDIT_LOGS` | `GET /api/v1/admin/audit-logs` |

Every API response is mapped through a facade before entering React Query:
- Products → `ProductFacade.toProduct` / `toProductList`
- Auth → `AuthFacade.toSession`
- Audit logs → `AdminFacade.toAuditLogList`

---

## 14.2 Auth handshake

```
1. User submits LoginForm
2. POST /api/v1/auth/login { email, password }
3. Backend responds:
   - JSON body: { success: true, data: { accessToken, refreshToken } }
   - Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
4. Frontend:
   - Decodes JWT payload to extract adminUser (sub, role)
   - Stores accessToken in Zustand (memory only)
   - refreshToken cookie is managed by the browser automatically
5. Subsequent requests: Axios interceptor attaches Authorization: Bearer <accessToken>
6. On 401: Axios interceptor calls POST /api/v1/auth/refresh
   - Cookie is sent automatically (withCredentials: true)
   - On success: new accessToken stored, original request retried
   - On failure: clearSession() + redirect to /
```

### Required backend CORS configuration

The backend must allow the frontend origin with credentials:

```bash
# backend/.env
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true
```

---

## 14.3 SSE connection

- `EventSource` URL: `VITE_SSE_URL` (default: `http://localhost:3000/api/v1/products/events`)
- `EventSource` does **not** support custom headers — the access token is NOT sent
- The SSE endpoint (`GET /api/v1/products/events`) must be **public** (no JWT middleware)
- The backend `product-service` broadcasts events after every product mutation

### Event types

| Event | Payload |
|---|---|
| `product.created` | `{ productId, name, price, eventId, occurredAt }` |
| `product.updated` | `{ productId, name, price, eventId, occurredAt }` |
| `product.deleted` | `{ productId, name, price, eventId, occurredAt }` |

---

## 14.4 CSRF flow

The backend uses a double-submit cookie pattern for admin mutations.

1. Backend sends CSRF token in the login response body (or as a separate header)
2. Frontend stores it in `authStore.csrfToken`
3. Axios request interceptor attaches `X-CSRF-Token: <csrfToken>` on all admin mutations:
   - `POST/PUT/PATCH/DELETE /api/v1/admin/*`
4. Backend middleware validates the header matches the expected token

**Note:** The current backend implementation does not yet send a CSRF token in the login response. When implemented, update `AuthFacade.toSession` to extract it and `useAuth.login` to call `setTokens(..., csrfToken)`.

---

## 14.5 WhatsApp redirect

```typescript
// In a component:
const { data } = useQuery({
  queryKey: ["products", "whatsapp", productId],
  queryFn: () => fetchWhatsappLink(productId),
});

// Open in new tab — never construct the URL client-side
if (data) {
  window.open(data.url, "_blank", "noopener,noreferrer");
}
```

The backend constructs the `wa.me` URL with the product name and price encoded in the `text` parameter.

---

## 14.6 Pagination & filters

Product list query params (must match backend exactly):

| Frontend param | Backend param | Type |
|---|---|---|
| `filters.page` | `page` | integer, default 1 |
| `filters.limit` | `limit` | integer, default 20, max 100 |
| `filters.name` | `name` | string |
| `filters.minPrice` | `min_price` | number |
| `filters.maxPrice` | `max_price` | number |
| `filters.isActive` | `is_active` | boolean |

Response envelope:
```json
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```

`usePagination` reads `meta.total` to compute `totalPages = Math.ceil(total / limit)`.

---

## 14.7 Environment parity

| Frontend env var | Backend env var | Relationship |
|---|---|---|
| `VITE_API_BASE_URL` | `API_GATEWAY_PORT` | Frontend points to the gateway port |
| `VITE_SSE_URL` | `PRODUCT_SERVICE_PORT` | SSE served by product-service via gateway |
| `VITE_APP_VERSION` | — | Frontend-only, injected at build time |

### docker-compose.override.yml

Add this to connect the frontend container to the backend network:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    ports:
      - "80:80"
    depends_on:
      api-gateway:
        condition: service_healthy
    networks:
      - infra_default

networks:
  infra_default:
    external: true
```

The `nginx.conf` proxies `/api/*` to `http://api-gateway:3000` using the Docker network hostname.
