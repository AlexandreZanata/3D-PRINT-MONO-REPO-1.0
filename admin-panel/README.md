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

- `VITE_API_BASE_URL` — optional; defaults to same-origin. Local dev uses the Vite proxy to the backend (see `vite.config.ts`).
