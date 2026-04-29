/**
 * POC — admin dev + API without CORS:
 *
 * 1. Run `pnpm dev` (port 8082). Do not set `VITE_API_BASE_URL` to `http://localhost:3000`.
 * 2. Log in; in DevTools → Network, the login POST must target **:8082** (same origin),
 *    path `/api/v1/auth/login`. Vite proxies `/api` to the gateway.
 *
 * If the request URL shows **:3000**, the client bypassed the proxy and the browser
 * will enforce CORS on the gateway response.
 */
export {};
