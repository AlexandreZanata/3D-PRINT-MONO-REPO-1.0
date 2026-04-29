# Forma Admin Panel

Vite + TanStack Router admin SPA (port **8082** in dev). Uses the same package manager as the backend and storefront: **pnpm**.

## Setup

From this directory:

```bash
pnpm install
```

Requires the API (e.g. api-gateway) running for `/api` — same as [frontend](../frontend).

## Scripts

| Command       | Description                    |
| ------------- | ------------------------------ |
| `pnpm dev`    | Dev server on port 8082        |
| `pnpm build`  | Production build               |
| `pnpm test`   | Vitest                         |
| `pnpm lint`   | ESLint                         |

## Environment

- **`pnpm dev`:** Do **not** set `VITE_API_BASE_URL` to `http://localhost:3000`. The browser must call the same origin (`http://localhost:8082`); Vite proxies `/api` to the gateway. Pointing Axios at port 3000 directly causes **CORS** (different origins) unless the backend whitelists `http://localhost:8082`.
- **`pnpm build` / production:** Set `VITE_API_BASE_URL` only when the API is on another host; that deployment must allow CORS or use the same origin via nginx.

See [docs/adr/0002-admin-panel-dev-api-proxy.md](../docs/adr/0002-admin-panel-dev-api-proxy.md).

### Auth / 403 on `/api/v1/admin/*`

The gateway returns **403** when the admin-service rejects the request before your handler runs, usually:

- **IP allowlist** (`ADMIN_ALLOWED_IPS`): the service normalizes `::ffff:127.0.0.1` to `127.0.0.1`. If you run in Docker, add the gateway container IP or set `ADMIN_ALLOWED_IPS` accordingly.
- **JWT role**: the access token must include role `admin` or `super_admin`.

**Refresh:** `/api/v1/auth/refresh` expects a JSON body `{ "refreshToken": "..." }` (not an empty POST). The SPA stores the refresh token from login and sends it on refresh and logout.
