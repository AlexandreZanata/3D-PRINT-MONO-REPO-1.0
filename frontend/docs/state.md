# State Management Reference

The Forma frontend uses two state layers:

- **Server state** — TanStack Query (React Query v5): products, admin data, audit logs
- **Client state** — Zustand: auth session, toast notifications

---

## authStore (`src/store/authStore.ts`)

Manages the admin authentication session.

### Shape

```typescript
interface AuthState {
  accessToken: string | null;   // In memory only — never persisted
  adminUser: AdminUser | null;  // { id, email, role }
  isAuthenticated: boolean;
  csrfToken: string | null;     // Attached to admin mutations
}
```

### Actions

| Action | Description |
|---|---|
| `setTokens(accessToken, adminUser, csrfToken?)` | Called after successful login |
| `setAccessToken(token)` | Called after silent token refresh |
| `clearSession()` | Called on logout or 401 refresh failure |

### When to use

- Read `isAuthenticated` in route guards (`AdminRoute`, `ProtectedRoute`)
- Read `adminUser` to display the logged-in user's name/role
- Read `accessToken` inside `httpClient` interceptors (via `getState()`)
- Never read `accessToken` in components — use the httpClient interceptor

### Security notes

- `accessToken` is stored in memory (Zustand), never in `localStorage` or cookies
- `refreshToken` is an HttpOnly cookie — the frontend never reads it directly
- On page reload, `AppProviders` calls `refreshToken()` to restore the session silently

---

## notificationStore (`src/store/notificationStore.ts`)

Manages a queue of toast notifications.

### Shape

```typescript
interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  durationMs: number;
}

interface NotificationState {
  queue: Notification[];
}
```

### Actions

| Action | Description |
|---|---|
| `push(notification)` | Adds a toast to the queue (auto-generates `id`) |
| `dismiss(id)` | Removes a specific toast |
| `clear()` | Removes all toasts |

### When to use

- Call `push` from hooks after mutations succeed or fail
- Call `push` from `useSSE` when reconnecting
- Render the queue in a `NotificationBanner` organism at the app root

---

## React Query (server state)

Query keys are defined as constants in each feature's hooks file:

```typescript
// features/products/hooks/useProducts.ts
export const PRODUCT_QUERY_KEYS = {
  list: (filters) => ["products", "list", filters],
  detail: (id) => ["products", "detail", id],
};
```

### Stale times

| Data | Stale time | Reason |
|---|---|---|
| Product list | 60s | SSE handles real-time updates |
| Product detail | 300s | Changes infrequently |
| Admin products | 0 | Always fresh for admin |
| Audit logs | 0 | Always fresh for admin |

### SSE cache updates

When an SSE event arrives, `useProductSSE` updates the cache directly:
- `product.created` → `invalidateQueries(["products","list"])`
- `product.updated` → `setQueryData` on detail + `setQueriesData` on all list entries
- `product.deleted` → filter item from list + `removeQueries` on detail
