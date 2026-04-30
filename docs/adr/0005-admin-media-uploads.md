# ADR-0005: Admin media uploads and public delivery

## Status

Accepted

## Context

Product and site settings store image references. Remote HTTPS URLs are valid, but operators also need to upload files through the admin API and have browsers load them without a separate CDN origin.

## Decision

1. **Storage:** Admin-service writes uploads to a configurable directory `ADMIN_UPLOAD_DIR` (default `data/uploads` under the process cwd), using Multer with a strict allowlist (JPEG, PNG, WebP) and a 5 MiB size cap. Filenames are opaque UUIDs plus an extension derived from the detected MIME type (client-provided names are ignored).
2. **Upload API:** Authenticated admins `POST /api/v1/admin/uploads` with multipart field `file`. The JSON response returns `{ url: "/api/v1/uploads/<filename>" }`.
3. **Public GET:** The same service exposes `GET /api/v1/uploads/*` via `express.static` on that directory, mounted before the JSON admin router so anonymous clients can load images by URL.
4. **Gateway:** The API gateway proxies `GET /api/v1/uploads` to admin-service (public rate limit) and streams `multipart/form-data` bodies to admin-service for admin routes (no JSON re-serialization for multipart).
5. **Contracts:** Product create/update accept either absolute `http(s)` URLs or same-origin paths matching `/api/v1/uploads/<safe filename>` (validated in `@repo/contracts`).

## Consequences

- Docker / production should mount a persistent volume on `ADMIN_UPLOAD_DIR` and back it up like any blob store.
- Horizontal scaling of admin-service replicas requires shared storage or a future migration to object storage (S3-compatible); until then, single-replica or shared volume is assumed.
- Image URLs stored in the database are path- or HTTPS-based; storefront and admin panels that proxy `/api` render them without extra base-URL logic for upload paths.
