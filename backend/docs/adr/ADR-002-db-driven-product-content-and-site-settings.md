# ADR-002 — Database-Driven Product Content and Site Settings

**Status:** Accepted  
**Date:** 2026-04-29  
**Deciders:** Engineering team

---

## Context

The initial implementation stored all product content (images, taglines, categories,
materials, dimensions) and all page copy (hero headline, story cards, footer text) as
static data in the frontend (`frontend/src/lib/products.ts` and hardcoded JSX).

This meant:
- Any content change required a code deploy.
- The admin panel could only edit price, stock, and description.
- Images were bundled as static assets — no runtime customisation.

---

## Decision

Move all product content and site-wide page copy into PostgreSQL, accessible and
editable through the admin panel.

### Product table extensions

Added to the `products` table:

| Column | Type | Purpose |
|---|---|---|
| `slug` | `TEXT UNIQUE` | URL-friendly identifier for SEO-stable product URLs |
| `tagline` | `TEXT NOT NULL DEFAULT ''` | Short marketing copy shown on cards and detail pages |
| `category` | `TEXT NOT NULL DEFAULT 'Decor'` | Enables server-side category filtering |
| `material` | `TEXT NOT NULL DEFAULT ''` | Displayed on product detail page |
| `dimensions` | `TEXT NOT NULL DEFAULT ''` | Displayed on product detail page |
| `images` | `JSONB NOT NULL DEFAULT '[]'` | Ordered array of image URLs; first element is primary |

`images` is stored as JSONB rather than a separate join table because:
- Image order matters and is trivially expressed as an array.
- No cross-product image sharing is needed.
- Avoids an extra join on every product fetch.

### Site settings table

A new `site_settings` table stores admin-editable page copy as a flat key-value store:

```sql
CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Keys use dot-notation namespacing (`hero.headline`, `footer.copyright`, etc.).

**Why key-value instead of typed columns?**  
Page copy fields are heterogeneous, change independently, and grow over time without
schema migrations. A key-value store lets the admin add new content areas without
touching the database schema. The frontend applies typed defaults for any missing key,
so the system degrades gracefully.

### API surface

- `GET /api/v1/site-settings` — public, served by product-service, no auth required.
- `GET /api/v1/admin/site-settings` — admin read (JWT required).
- `PUT /api/v1/admin/site-settings` — admin write, body `{ settings: Record<string, string> }`.

The public endpoint is served by `product-service` (not `admin-service`) so it is
available without authentication and benefits from the same rate-limiting tier as
the product catalog.

---

## Consequences

**Positive:**
- All content is editable via the admin panel without a code deploy.
- Product slugs enable stable, SEO-friendly URLs.
- Multiple images per product are supported.
- Category filtering is now server-side (scalable to large catalogs).
- The frontend no longer contains any hardcoded product data.

**Negative / trade-offs:**
- The `images` JSONB column is not individually queryable by image URL without a GIN
  index. This is acceptable because image-level queries are not a use case.
- The key-value site settings model has no schema enforcement at the DB level.
  Typos in keys silently fall back to frontend defaults. Mitigation: the admin UI
  uses a fixed form with known keys.
- Adding a new content area requires a frontend form change and a migration to seed
  the default value — two steps instead of one.

---

## Alternatives considered

### Separate `product_images` join table
Rejected: adds a join to every product fetch, complicates the repository, and
provides no benefit since images are always fetched with their product.

### CMS (Contentful, Sanity, etc.)
Rejected: introduces an external dependency, adds cost, and is disproportionate
for a single-tenant admin panel that already has a PostgreSQL database.

### Typed columns for each setting (hero_headline TEXT, hero_image_url TEXT, …)
Rejected: requires a migration for every new content area. The key-value model
is more flexible and the admin UI enforces the schema at the application layer.
