You are a senior React + TypeScript architect. Organize and extend the existing React
frontend into a production-ready, professionally structured application. Reuse every
existing component and file — do not delete or rewrite from scratch unless a file
directly violates the rules below. Refactor in place and move files to the correct
location. Output only code and config files. All code, comments, variable names,
function names, file names, folder names, and documentation must be written entirely
in English. Zero mixed language.

═══════════════════════════════════════════════════════════
SECTION 1 — PROJECT OVERVIEW
═══════════════════════════════════════════════════════════

This is the frontend app for an e-commerce-style platform. It must:
- Display a public product catalog (list + detail) updated in real time via SSE
- Provide a secure admin panel (login, product CRUD, audit log viewer)
- Redirect users to WhatsApp with product context (wa.me deep-link)
- Consume the backend REST API described in docs/api.md
- Handle auth tokens (access + refresh) transparently via an HTTP client facade
- Show real-time updates from SSE without full page reload

The existing React files must be preserved and reorganized, not rewritten, unless
they violate a hard rule listed in Section 3.

═══════════════════════════════════════════════════════════
SECTION 2 — FOLDER STRUCTURE (ATOMIC DESIGN + FEATURE MODULES)
═══════════════════════════════════════════════════════════

apps/web/src/
├── atoms/                  # Smallest indivisible UI units — no business logic, no API calls
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx   (if Storybook is present)
│   │   └── index.ts
│   ├── Input/
│   ├── Badge/
│   ├── Spinner/
│   ├── Avatar/
│   └── ...                 # One folder per atom, same structure
│
├── molecules/              # Compositions of 2–5 atoms, still no API calls
│   ├── ProductCard/
│   ├── SearchBar/
│   ├── PaginationBar/
│   ├── FormField/          # Label + Input + ErrorText
│   ├── NotificationBanner/
│   └── ...
│
├── organisms/              # Self-contained UI sections, may receive data via props only
│   ├── ProductGrid/
│   ├── ProductDetail/
│   ├── AdminSidebar/
│   ├── AdminProductTable/
│   ├── AuditLogTable/
│   ├── LoginForm/
│   └── ...
│
├── templates/              # Page layouts — define slots, no data fetching
│   ├── PublicLayout/       # Header + main + footer
│   ├── AdminLayout/        # Sidebar + topbar + main
│   └── AuthLayout/         # Centered card layout for login
│
├── pages/                  # Route-level components — compose templates + organisms
│   ├── ProductListPage/
│   ├── ProductDetailPage/
│   ├── AdminProductsPage/
│   ├── AdminAuditLogPage/
│   └── LoginPage/
│
├── features/               # Business feature modules (colocate everything for one feature)
│   ├── products/
│   │   ├── api/            # API calls for this feature (uses facades/httpClient)
│   │   ├── hooks/          # useProducts, useProductDetail, useProductSSE
│   │   ├── store/          # Zustand slice or React context for this feature
│   │   ├── types/          # Feature-specific TypeScript types (extend @repo/contracts)
│   │   └── index.ts        # Public barrel — only export what pages/organisms need
│   ├── admin/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── types/
│   └── auth/
│       ├── api/
│       ├── hooks/          # useAuth, useRequireAdmin
│       ├── store/          # Token storage, user session
│       └── types/
│
├── facades/                # Thin wrappers that translate raw API responses into domain types
│   ├── ProductFacade.ts    # toProduct(), toProductList()
│   ├── AdminFacade.ts      # toAdmin(), toAuditLog()
│   └── AuthFacade.ts       # toSession(), toTokenPair()
│
├── api/                    # HTTP layer — all fetch/axios calls live here only
│   ├── httpClient.ts       # Axios instance with interceptors (token attach + refresh)
│   ├── endpoints.ts        # All API path constants
│   ├── products.api.ts     # Product endpoint functions
│   ├── admin.api.ts        # Admin endpoint functions
│   ├── auth.api.ts         # Auth endpoint functions
│   └── sse.ts              # SSE connection manager (EventSource wrapper)
│
├── hooks/                  # Global/shared hooks (not feature-specific)
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── usePagination.ts
│   └── useSSE.ts           # Subscribes to SSE stream, dispatches to product store
│
├── store/                  # Global Zustand stores
│   ├── authStore.ts        # accessToken, refreshToken, user, isAuthenticated
│   ├── notificationStore.ts# Toast queue
│   └── index.ts
│
├── router/
│   ├── AppRouter.tsx       # React Router v6 route definitions
│   ├── ProtectedRoute.tsx  # Redirects unauthenticated users
│   └── AdminRoute.tsx      # Redirects non-admin users
│
├── lib/                    # Pure utilities — no React, no API, no side effects
│   ├── formatCurrency.ts
│   ├── formatDate.ts
│   ├── buildWhatsappUrl.ts
│   └── sanitize.ts         # Strip HTML from display strings
│
├── styles/
│   ├── tokens.css          # Design tokens (colors, spacing, radii, shadows as CSS vars)
│   ├── reset.css
│   └── globals.css
│
├── types/
│   └── env.d.ts            # import.meta.env typings
│
└── main.tsx                # App entry point

═══════════════════════════════════════════════════════════
SECTION 3 — FILE SIZE & COMPLEXITY LIMITS (HARD RULES)
═══════════════════════════════════════════════════════════

- Maximum 200 lines per file (blank lines and comments count)
- Maximum 1 exported component or 1 exported function set per file
- Maximum 3 props that are functions (callbacks) per component — group extras into an
  object prop (e.g. handlers: { onSave, onCancel, onDelete })
- No component may call fetch(), axios, or EventSource directly — all network calls go
  through api/ layer only
- No inline styles — use CSS Modules (*.module.css) or Tailwind utility classes only
- No magic strings for API paths — use endpoints.ts constants only
- No any, no non-null assertion (!) without an explanatory comment
- No useEffect that fetches data — use React Query (TanStack Query) hooks instead
- Components in atoms/ and molecules/ must be pure: receive all data via props,
  emit all actions via callbacks, contain zero hooks that call the store or API

═══════════════════════════════════════════════════════════
SECTION 4 — TYPESCRIPT CONFIGURATION
═══════════════════════════════════════════════════════════

Extend the root tsconfig.base.json already defined in the monorepo.
Additional settings for the web app:
"jsx": "react-jsx",
"lib": ["ES2022", "DOM", "DOM.Iterable"],
"types": ["vite/client"],
"paths" must resolve @repo/* to the monorepo packages (types from @repo/contracts
are shared directly — no duplication of type definitions)

Import alias: "@/" maps to "src/" so imports never use relative ../../../.

═══════════════════════════════════════════════════════════
SECTION 5 — STATE MANAGEMENT
═══════════════════════════════════════════════════════════

5.1 Server state — TanStack Query (React Query v5)
- All API data (products, admin data, audit logs) managed by React Query.
- Query keys defined as constants in each feature/*/hooks/ file.
- Mutations (create, update, delete) call queryClient.invalidateQueries after success.
- Stale time: product list = 60s, product detail = 300s, admin data = 0 (always fresh).
- On SSE product event received: manually update the React Query cache via
  queryClient.setQueryData — do NOT refetch the full list.

5.2 Client state — Zustand
- authStore: accessToken, refreshToken, adminUser, isAuthenticated, actions: setTokens,
  clearSession.
- notificationStore: queue of { id, type, message, duration } toasts.
- No other global client state — everything else is local component state or React Query.

5.3 SSE integration
- useSSE hook (src/hooks/useSSE.ts) opens an EventSource to GET /api/v1/products/events.
- On "product.created": add item to React Query cache for the product list.
- On "product.updated": update item in React Query cache.
- On "product.deleted": remove item from React Query cache.
- Connection lifecycle: open on mount of ProductListPage, close on unmount.
- On EventSource error: exponential backoff reconnect (max 5 attempts), show a
  "Reconnecting..." banner via notificationStore.

═══════════════════════════════════════════════════════════
SECTION 6 — HTTP CLIENT & AUTH FLOW
═══════════════════════════════════════════════════════════

6.1 Axios instance (api/httpClient.ts)
- baseURL from import.meta.env.VITE_API_BASE_URL.
- Request interceptor: attach Authorization: Bearer <accessToken> from authStore.
- Response interceptor:
  On 401 → attempt silent refresh (POST /api/v1/auth/refresh with refreshToken).
  On refresh success → update authStore tokens → retry original request once.
  On refresh failure → call authStore.clearSession() → redirect to /login.
- Attach X-Correlation-ID header (UUIDv4 generated client-side per request).
- Never log accessToken or refreshToken values.

6.2 Token storage
- accessToken: memory only (Zustand store, not localStorage).
- refreshToken: HttpOnly cookie set by the backend — the frontend never reads it
  directly. The Axios instance sends credentials: "include" so the cookie is
  automatically attached.
- On page reload: attempt a silent refresh call on app startup (main.tsx) to restore
  session from the cookie. If it fails, the user stays unauthenticated.

6.3 CSRF
- Admin mutations must include the X-CSRF-Token header.
- The token is fetched once on admin login and stored in authStore.csrfToken.
- AdminRoute adds the header automatically via an Axios request interceptor scoped to
  /api/v1/admin/* paths.

═══════════════════════════════════════════════════════════
SECTION 7 — FACADES (FRONT-END DATA MAPPING)
═══════════════════════════════════════════════════════════

Facades translate raw API response shapes into the frontend domain types.
They are pure functions — no side effects, no async.

ProductFacade.ts:
toProduct(raw: ApiProduct): Product
toProductList(raw: ApiProductList): ProductList
toWhatsappUrl(raw: ApiWhatsappResponse): string

AuthFacade.ts:
toSession(raw: ApiLoginResponse): Session
— extracts accessToken, adminUser fields, normalizes dates

AdminFacade.ts:
toAuditLog(raw: ApiAuditLog): AuditLog
toAuditLogList(raw: ApiAuditLog[]): AuditLog[]

Facades are called inside the api/ functions before returning data to hooks.
React Query hooks receive already-mapped domain types — never raw API shapes.

═══════════════════════════════════════════════════════════
SECTION 8 — ROUTING
═══════════════════════════════════════════════════════════

Use React Router v6 with createBrowserRouter.

Routes:
/                         → ProductListPage   (public)
/products/:id             → ProductDetailPage (public)
/login                    → LoginPage         (redirect to /admin if already authenticated)
/admin                    → redirect to /admin/products
/admin/products           → AdminProductsPage (AdminRoute guard)
/admin/products/new       → AdminProductFormPage (AdminRoute guard)
/admin/products/:id/edit  → AdminProductFormPage (AdminRoute guard)
/admin/audit-logs         → AdminAuditLogPage (AdminRoute guard)
*                         → NotFoundPage

ProtectedRoute: if !isAuthenticated → navigate to /login, preserve intended destination
in location.state.from for post-login redirect.
AdminRoute: extends ProtectedRoute + checks user.role === "admin".

Lazy-load all admin pages: React.lazy + Suspense with a full-page Spinner fallback.

═══════════════════════════════════════════════════════════
SECTION 9 — FORMS
═══════════════════════════════════════════════════════════

Use React Hook Form v7 + Zod resolvers (shared schemas from @repo/contracts).

LoginForm:
fields: email (string, email format), password (string, min 8)
on submit: call auth.api.ts login() → store tokens → navigate to /admin

ProductForm (create + edit):
fields: name, description, price (number, positive), stock (integer ≥ 0),
whatsapp_number (E.164 format), image_url (URL format), is_active (boolean)
Reuse the Zod schema from @repo/contracts/src/product.schema.ts.
On submit: call admin.api.ts createProduct() or updateProduct() → invalidate queries
→ show success toast → navigate back to /admin/products.

All form fields use the FormField molecule (Label + Input/Textarea + error message).
No raw <input> tags outside of atoms/.

═══════════════════════════════════════════════════════════
SECTION 10 — DESIGN SYSTEM & STYLING
═══════════════════════════════════════════════════════════

- Use Tailwind CSS v3. tailwind.config.ts must reference src/ for content paths.
- Design tokens defined as CSS custom properties in styles/tokens.css, also mapped
  into tailwind.config.ts under theme.extend so Tailwind classes use them.
- Tokens required:
  --color-primary, --color-primary-hover
  --color-danger, --color-success, --color-warning
  --color-bg-surface, --color-bg-page
  --color-text-primary, --color-text-muted
  --radius-sm, --radius-md, --radius-lg
  --shadow-card
- All atoms must support a size prop (sm | md | lg) and a variant prop where applicable
  (primary | secondary | danger | ghost).
- Dark mode: class-based ("class" strategy in Tailwind). Toggle stored in localStorage
  via a useDarkMode hook. Root <html> gets class="dark" when enabled.
- All interactive elements must have visible focus rings (focus-visible styles).
- No hardcoded color hex values anywhere outside tokens.css.

═══════════════════════════════════════════════════════════
SECTION 11 — TESTING
═══════════════════════════════════════════════════════════

Use Vitest + React Testing Library. Setup file: src/test/setup.ts.

Atoms: test every variant and size. Snapshot + interaction.
Molecules: test composed behavior (e.g. SearchBar calls onSearch with debounced value).
Hooks: test with renderHook. Mock API calls with msw (Mock Service Worker).
Facades: pure function tests — input/output only, no mocking needed.
Pages: smoke test (renders without crashing) + key user interactions.

MSW handlers defined in src/test/handlers/ — one file per feature, mirroring the
backend API contract exactly (use @repo/contracts types for response shapes).

Test naming: "should <expected behavior> when <condition>" — same convention as backend.
Coverage target: 70% lines minimum on atoms, molecules, facades, and hooks.

═══════════════════════════════════════════════════════════
SECTION 12 — ENVIRONMENT & BUILD
═══════════════════════════════════════════════════════════

Use Vite v5 as the build tool.

Required environment variables (add to .env.example at the app root):
VITE_API_BASE_URL=http://localhost:3000   # backend api-gateway URL
VITE_SSE_URL=http://localhost:3000/api/v1/products/events
VITE_APP_VERSION=$npm_package_version

vite.config.ts must configure:
- Path alias: "@/" → "./src/"
- Proxy /api → VITE_API_BASE_URL in dev (avoids CORS in local development)
- Build output to dist/
- Source maps in production (external file, not inlined)

Dockerfile for the web app (apps/web/Dockerfile):
- Stage 1 (builder): node:22-alpine, pnpm install, vite build
- Stage 2 (runner): nginx:alpine, copy dist/, custom nginx.conf that:
  serves index.html for all routes (SPA fallback)
  proxies /api/* to the api-gateway container
  sets Cache-Control: no-store for index.html
  sets Cache-Control: max-age=31536000,immutable for /assets/*

═══════════════════════════════════════════════════════════
SECTION 13 — DOCUMENTATION
═══════════════════════════════════════════════════════════

apps/web/README.md — must include:
- Architecture overview (Atomic Design layers explained with examples from this project)
- Folder structure annotated
- How to run locally (pnpm dev)
- How to run tests (pnpm test)
- Environment variables reference
- Auth flow diagram (text-based, ASCII or Mermaid)
- SSE integration diagram

apps/web/docs/
├── components.md   — Every atom and molecule listed with: purpose, props table,
│                     usage example (JSX snippet)
├── facades.md      — Each facade function: input type, output type, mapping logic
├── hooks.md        — Each custom hook: purpose, parameters, return value, example
├── state.md        — Zustand stores documented: shape, actions, when to use
└── api-layer.md    — HTTP client setup, interceptors, endpoint functions reference

Each atom and molecule folder must contain a *.stories.tsx file if Storybook is in the
project, or a *.example.tsx file (non-rendered, just for documentation) if it is not.

═══════════════════════════════════════════════════════════
SECTION 14 — BACKEND INTEGRATION CHECKLIST
═══════════════════════════════════════════════════════════

After generating all frontend files, output a file at apps/web/docs/backend-integration.md
covering every integration point:

14.1 API contract alignment
- Every endpoint called by the frontend must reference the exact path constant from
api/endpoints.ts and match the OpenAPI spec in docs/api.md.
- Every request body type used in api/*.api.ts must import from @repo/contracts —
no locally defined request shapes.
- Every API response is mapped through a facade before entering component state.

14.2 Auth handshake
- Step-by-step: login → receive accessToken (JSON body) + refreshToken (HttpOnly cookie)
→ store accessToken in Zustand → subsequent requests attach Bearer header
→ on 401 → silent refresh using cookie → on failure → logout.
- The backend must have CORS configured to allow the frontend origin AND
credentials: true. Document the required backend env vars:
CORS_ORIGIN=http://localhost:5173   (Vite dev server)
CORS_CREDENTIALS=true

14.3 SSE connection
- EventSource URL must match VITE_SSE_URL env var.
- EventSource does not support custom headers — access token is NOT sent.
The SSE endpoint is public (no auth) by design (matches backend Section 10).
- Document that the SSE endpoint must not be behind the JWT middleware.

14.4 CSRF flow
- Backend sends the CSRF token in the response body of POST /api/v1/auth/login.
- Frontend stores it in authStore.csrfToken.
- Frontend attaches it as X-CSRF-Token header on every admin mutation
(POST, PUT, DELETE to /api/v1/admin/*).
- Document the backend middleware that validates this header.

14.5 WhatsApp redirect
- Frontend calls GET /api/v1/products/:id/whatsapp → receives { url: string }.
- Opens the URL in a new tab: window.open(url, "_blank", "noopener,noreferrer").
- Do not construct the wa.me URL client-side — always delegate to the backend.

14.6 Pagination & filters
- Product list query params must match exactly: page, limit, name, min_price,
max_price, is_active.
- Response envelope shape: { success: true, data: Product[], meta: { page, limit, total } }.
- usePagination hook reads meta.total to compute total pages.

14.7 Environment parity
- Provide a table mapping every VITE_* frontend env var to the corresponding
backend env var it depends on.
- Provide a docker-compose.override.yml snippet showing how the web service
connects to the api-gateway within the monorepo Docker network.

═══════════════════════════════════════════════════════════
SECTION 15 — FINAL CHECKLIST (GENERATE ALL OF THESE)
═══════════════════════════════════════════════════════════

Generate or refactor the following files completely:

1.  apps/web/package.json
2.  apps/web/vite.config.ts
3.  apps/web/tsconfig.json
4.  apps/web/tailwind.config.ts
5.  apps/web/postcss.config.js
6.  apps/web/.env.example
7.  apps/web/Dockerfile + nginx.conf
8.  apps/web/src/main.tsx  (silent refresh on startup)
9.  apps/web/src/styles/tokens.css + reset.css + globals.css
10. apps/web/src/api/httpClient.ts
11. apps/web/src/api/endpoints.ts
12. apps/web/src/api/products.api.ts
13. apps/web/src/api/admin.api.ts
14. apps/web/src/api/auth.api.ts
15. apps/web/src/api/sse.ts
16. apps/web/src/facades/ProductFacade.ts + tests
17. apps/web/src/facades/AuthFacade.ts + tests
18. apps/web/src/facades/AdminFacade.ts + tests
19. apps/web/src/store/authStore.ts
20. apps/web/src/store/notificationStore.ts
21. apps/web/src/hooks/useSSE.ts + tests
22. apps/web/src/hooks/useDebounce.ts + tests
23. apps/web/src/hooks/usePagination.ts + tests
24. apps/web/src/hooks/useLocalStorage.ts + tests
25. apps/web/src/lib/formatCurrency.ts + tests
26. apps/web/src/lib/formatDate.ts + tests
27. apps/web/src/lib/buildWhatsappUrl.ts + tests
28. apps/web/src/lib/sanitize.ts + tests
29. All atoms (Button, Input, Badge, Spinner, Avatar) — component + test + story/example
30. All molecules (ProductCard, SearchBar, PaginationBar, FormField, NotificationBanner)
31. All organisms (ProductGrid, ProductDetail, AdminSidebar, AdminProductTable,
    AuditLogTable, LoginForm)
32. All templates (PublicLayout, AdminLayout, AuthLayout)
33. All pages (ProductListPage, ProductDetailPage, AdminProductsPage,
    AdminProductFormPage, AdminAuditLogPage, LoginPage, NotFoundPage)
34. apps/web/src/features/products/ — api, hooks, store, types
35. apps/web/src/features/admin/ — api, hooks, store, types
36. apps/web/src/features/auth/ — api, hooks, store, types
37. apps/web/src/router/AppRouter.tsx + ProtectedRoute + AdminRoute
38. apps/web/src/test/setup.ts + handlers/ (MSW mocks for every endpoint)
39. apps/web/README.md
40. apps/web/docs/components.md
41. apps/web/docs/facades.md
42. apps/web/docs/hooks.md
43. apps/web/docs/state.md
44. apps/web/docs/api-layer.md
45. apps/web/docs/backend-integration.md

For every existing file that is being reorganized, output a migration comment at the top:
// MIGRATED FROM: <original path> — moved to comply with atomic design structure

Begin generating all files now. For each file output:
// FILE: <relative path from repo root>
<complete file content>

Do not skip any file. Do not use placeholders. All components and functions must be
fully implemented using the existing project code as the base.