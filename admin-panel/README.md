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

- **IP allowlist** (`ADMIN_ALLOWED_IPS`): admin-service reads the client IP with **`trust proxy`** (`ADMIN_TRUST_PROXY_HOPS`, default `1`). The gateway sets **`X-Forwarded-For`** on `/api/v1/admin/*` to the peer that connected **to the gateway** (not the internal Docker hop). Allowlist that address (for `pnpm dev`, typically `127.0.0.1` / `::1`). Entries may be **IPv4 CIDR** (e.g. `172.16.0.0/12`) for Docker clients on `172.x.x.x`.
- **JWT role**: the access token must include role `admin` or `super_admin`.

See [ADR 0003](../docs/adr/0003-admin-ip-behind-gateway.md).

If you still get **`IP_NOT_ALLOWED`** with a `172.x.x.x` address: **rebuild and restart** `admin-service` so it runs the latest code. The service **auto-appends** `172.16.0.0/12` to `ADMIN_ALLOWED_IPS` when it is set (e.g. `127.0.0.1,::1`) unless **`ADMIN_ALLOW_DOCKER_BRIDGE=0`**. To lock the allowlist manually, set `ADMIN_ALLOW_DOCKER_BRIDGE=0` and list every allowed IP/CIDR yourself.

**Refresh:** `/api/v1/auth/refresh` expects a JSON body `{ "refreshToken": "..." }` (not an empty POST). The SPA stores the refresh token from login and sends it on refresh and logout.
