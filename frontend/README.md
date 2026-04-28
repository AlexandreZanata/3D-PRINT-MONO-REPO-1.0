# Forma Frontend

React + TypeScript frontend for the Forma 3D print shop. Consumes the backend REST API, displays a real-time product catalog via SSE, and provides a secure admin panel.

---

## Architecture overview — Atomic Design

The UI is organized in five layers. Each layer may only import from layers below it.

```
pages/routes      ← compose templates + organisms, handle navigation
templates         ← define layout slots (header, sidebar, main)
organisms         ← self-contained sections (SiteHeader, LoginForm, ProductForm)
molecules         ← 2–5 atoms composed together (FormField, ProductCard)
atoms/ui          ← smallest indivisible units (Button, Input, Badge — shadcn/ui)
```

**Feature modules** (`src/features/`) colocate everything for one domain:
- `features/products/` — hooks, types for the public catalog
- `features/admin/` — hooks, types for admin CRUD
- `features/auth/` — hooks, types for login/logout
- `features/cart/` — CartProvider + useCart (local state only)

**API layer** (`src/api/`) — all HTTP calls live here. No component may call `fetch` or `axios` directly.

**Facades** (`src/facades/`) — pure functions that map raw API shapes to frontend domain types.

**Stores** (`src/store/`) — Zustand for client state (auth tokens, toast queue).

---

## Folder structure

```
frontend/src/
├── api/              # HTTP layer — httpClient, endpoints, *.api.ts, sse.ts
├── atoms/ui/         # shadcn/ui primitives (Button, Input, Badge, …)
├── molecules/        # Composed atoms (FormField, ProductCard, ProductCarousel)
├── organisms/        # Self-contained sections (SiteHeader, LoginForm, ProductForm)
├── templates/        # Layout shells (PublicLayout)
├── features/         # Feature modules (products, admin, auth, cart)
│   └── <feature>/
│       ├── api/      # Feature-specific API calls (if needed)
│       ├── hooks/    # React Query hooks
│       ├── store/    # Feature-local Zustand slices (if needed)
│       └── types/    # Frontend domain types
├── facades/          # Pure mapping functions (ProductFacade, AuthFacade, AdminFacade)
├── hooks/            # Shared hooks (useDebounce, usePagination, useSSE, useDarkMode)
├── lib/              # Pure utilities (formatCurrency, formatDate, sanitize, …)
├── router/           # Route guards (ProtectedRoute, AdminRoute)
├── routes/           # TanStack Router file-based routes
├── store/            # Global Zustand stores (authStore, notificationStore)
├── styles/           # CSS (globals.css, tokens.css, reset.css)
├── test/             # Vitest setup, MSW handlers
└── types/            # Global TypeScript declarations (env.d.ts)
```

---

## How to run locally

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Start the backend (from the backend/ directory)
cd ../backend && make dev

# 4. Start the frontend dev server
pnpm dev
# → http://localhost:8081 (or next available port)
```

---

## How to run tests

```bash
pnpm test          # run all tests once
pnpm test --watch  # watch mode
```

Tests use Vitest + React Testing Library + MSW. See `src/test/` for setup and handlers.

---

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend api-gateway URL | `http://localhost:3000` |
| `VITE_SSE_URL` | Full SSE endpoint URL | `http://localhost:3000/api/v1/products/events` |
| `VITE_APP_VERSION` | App version (injected at build) | `0.1.0` |

Copy `.env.example` to `.env` and fill in values for local development.

---

## Auth flow

```
User submits login form
        │
        ▼
POST /api/v1/auth/login
        │
        ├─ success ──► accessToken (JSON body) stored in Zustand (memory only)
        │              refreshToken (HttpOnly cookie, set by backend)
        │              adminUser decoded from JWT payload
        │              navigate to /admin/products
        │
        └─ failure ──► show error message

On every API request:
  Axios interceptor attaches Authorization: Bearer <accessToken>

On 401 response:
  Axios interceptor calls POST /api/v1/auth/refresh (cookie sent automatically)
        │
        ├─ success ──► new accessToken stored → original request retried
        └─ failure ──► clearSession() → redirect to /
```

---

## SSE integration

```
ProductListPage mounts
        │
        ▼
useProductSSE() → useSSE() → openSSEConnection(VITE_SSE_URL)
        │
        ├─ product.created  → queryClient.invalidateQueries(["products","list"])
        ├─ product.updated  → queryClient.setQueryData (detail + list cache)
        └─ product.deleted  → remove from list cache + remove detail cache

On EventSource error:
  Exponential backoff reconnect (max 5 attempts, base 1s)
  Shows "Reconnecting…" toast via notificationStore

On ProductListPage unmount:
  EventSource.close() called via cleanup function
```
