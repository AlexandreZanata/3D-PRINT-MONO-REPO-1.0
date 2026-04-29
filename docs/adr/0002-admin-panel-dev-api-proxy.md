# ADR 0002: Admin panel dev — same-origin API via Vite proxy

## Status

Accepted

## Context

The admin SPA runs on `http://localhost:8082` in development. The API gateway listens on another port (e.g. `3000`). Browsers treat different ports as different origins, so if the SPA’s HTTP client used `baseURL: http://localhost:3000`, every `/api` call would be cross-origin and require CORS response headers (`Access-Control-Allow-Origin`, etc.) on preflight `OPTIONS` requests.

## Decision

In **development** (`import.meta.env.DEV`), the admin client always uses an **empty** Axios `baseURL` so requests go to `http://localhost:8082/api/...`. The Vite dev server proxies `/api` to the gateway (`vite.config.ts`); the browser sees same-origin requests and **no CORS** is required for local dev.

`VITE_API_BASE_URL` is applied only in **production** builds when the static app and API may be on different hosts.

## Consequences

- Developers must not set `VITE_API_BASE_URL=http://localhost:3000` for local `pnpm dev` if they expect the proxy to apply.
- Production deployments that call a separate API host must configure CORS on the gateway or terminate TLS at a reverse proxy that shares origin with the app.
