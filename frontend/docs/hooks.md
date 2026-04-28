# Hooks Reference

All custom hooks in the Forma frontend.

---

## Shared hooks (`src/hooks/`)

### `useDebounce<T>(value: T, delayMs?: number): T`

Returns a debounced version of `value` that only updates after `delayMs` (default 300ms) without a new value.

**Example:**
```tsx
const debouncedSearch = useDebounce(searchQuery, 400);
```

---

### `usePagination(opts: { page, limit, total }): PaginationState`

Computes pagination state from server-returned meta values.

**Returns:** `{ page, limit, total, totalPages, hasPrev, hasNext }`

**Example:**
```tsx
const pagination = usePagination({ page: 1, limit: 20, total: 100 });
// pagination.totalPages === 5
```

---

### `useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]`

Persists state to `localStorage`. Syncs across browser tabs via the `storage` event.

**Example:**
```tsx
const [theme, setTheme] = useLocalStorage("theme", "light");
```

---

### `useDarkMode(): { isDark, toggle, setDark }`

Manages dark mode preference. Stores in `localStorage("forma_dark_mode")`. Applies/removes `class="dark"` on `<html>` for Tailwind's class-based dark mode.

**Example:**
```tsx
const { isDark, toggle } = useDarkMode();
```

---

### `useSSE(onEvent: SSEHandler): void`

Opens an `EventSource` connection on mount, closes on unmount. Retries with exponential backoff (max 5 attempts, base 1s) on error. Shows a "Reconnecting…" toast via `notificationStore`.

**Parameters:**
- `onEvent` — must be memoized with `useCallback` to avoid reconnecting on every render

**Example:**
```tsx
const handleEvent = useCallback((type, payload) => { ... }, []);
useSSE(handleEvent);
```

---

### `useMobile(): boolean`

Returns `true` when viewport width is below 768px. Subscribes to `matchMedia` changes.

---

## Feature hooks (`src/features/*/hooks/`)

### `useProducts(filters?: ProductFilters)`

Fetches the public product list. Stale time: 60s.

**Returns:** `{ data: ProductList | undefined, isLoading, isError }`

---

### `useProductDetail(id: string)`

Fetches a single product by ID. Stale time: 300s.

**Returns:** `{ data: Product | undefined, isLoading, isError }`

---

### `useProductSSE()`

Subscribes to SSE events and updates the React Query cache directly. Must be called in `ProductListPage`.

---

### `useAdminProducts(page?, limit?)`

Fetches all products including inactive ones. Stale time: 0 (always fresh).

---

### `useCreateProduct()` / `useUpdateProduct()` / `useDeleteProduct()`

Mutations that invalidate `["admin", "products"]` on success.

---

### `useAuditLogs(page?, limit?)`

Fetches paginated audit logs. Stale time: 0.

---

### `useAuth()`

Provides `login` mutation, `logout` mutation, `isAuthenticated`, `adminUser`. Wires mutations to `authStore`.
