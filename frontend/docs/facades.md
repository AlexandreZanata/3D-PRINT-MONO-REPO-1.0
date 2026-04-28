# Facades Reference

Facades are pure functions that translate raw API response shapes into frontend domain types. They have no side effects and no async operations. They are called inside `src/api/*.api.ts` functions — React Query hooks receive already-mapped domain types, never raw API shapes.

---

## ProductFacade (`src/facades/ProductFacade.ts`)

### `toProduct(raw: ApiProduct): Product`

Maps a raw API product to the frontend `Product` type. Normalizes `price` and `stock` from `string | number` to `number` (Drizzle ORM returns numeric columns as strings).

| Input | Output |
|---|---|
| `ApiProduct` (price may be string) | `Product` (price always number) |

### `toProductList(raw: ApiProductList): ProductList`

Maps a paginated API response to `ProductList`. Calls `toProduct` for each item.

| Input | Output |
|---|---|
| `ApiProductList` | `ProductList` |

### `toWhatsappUrl(raw: ApiWhatsappResponse): string`

Extracts the `url` string from the API response envelope.

| Input | Output |
|---|---|
| `{ url: string }` | `string` |

---

## AuthFacade (`src/facades/AuthFacade.ts`)

### `toSession(raw: ApiLoginResponse, email: string): Session`

Decodes the JWT access token payload (base64url, no signature verification) to extract `sub` (adminId) and `role`. Combines with the provided email to build the `Session` object.

| Input | Output |
|---|---|
| `ApiLoginResponse` + `email: string` | `Session` |

**Note:** JWT signature verification happens on the server. Client-side decoding is safe for reading claims — never for authorization decisions.

---

## AdminFacade (`src/facades/AdminFacade.ts`)

### `toAuditLog(raw: ApiAuditLog): AuditLog`

Direct mapping from raw API audit log to frontend `AuditLog` type. Exists to decouple the API shape from the UI type — if the backend renames a field, only this function changes.

| Input | Output |
|---|---|
| `ApiAuditLog` | `AuditLog` |

### `toAuditLogList(raw: ApiAuditLog[], meta): AuditLogList`

Maps an array of audit logs with pagination metadata.

| Input | Output |
|---|---|
| `ApiAuditLog[]` + `{ page, limit, total }` | `AuditLogList` |
