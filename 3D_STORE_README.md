# 3D Product Store — Architecture & Implementation Guide

> Reference document for the 3D customizable product store.  
> Covers: `.3mf` rendering pipeline, product categorization, search strategy,
> frontend organization, and image/asset best practices.

---

## Table of contents

1. [Should you render `.3mf` directly?](#1-should-you-render-3mf-directly)
2. [Asset pipeline — from upload to browser](#2-asset-pipeline--from-upload-to-browser)
3. [Viewer architecture](#3-viewer-architecture)
4. [Product data model for 3D + customizable items](#4-product-data-model-for-3d--customizable-items)
5. [Category taxonomy](#5-category-taxonomy)
6. [Search strategy](#6-search-strategy)
7. [Frontend component organization](#7-frontend-component-organization)
8. [Image and asset best practices](#8-image-and-asset-best-practices)
9. [Performance budget](#9-performance-budget)
10. [Backend additions required](#10-backend-additions-required)
11. [Implementation checklist](#11-implementation-checklist)

---

## 1. Should you render `.3mf` directly?

**Short answer: no — convert to glTF first, then render.**

`.3mf` (3D Manufacturing Format) is a ZIP archive containing XML geometry, textures,
and print metadata. Browsers have no native `.3mf` support. Parsing it client-side is
expensive (5–80 MB files, XML tokenizing on the main thread = jank).

**The right pipeline:**

```
upload .3mf
    → worker-service converts to .glb (glTF binary, Draco compressed)
    → generates 3 LOD levels + WebP thumbnail
    → stores all on object storage (S3 / Cloudflare R2)
    → browser loads .glb via Three.js — fast, hardware-accelerated
```

**Why glTF/glb:**
- Industry standard for real-time 3D (Khronos Group)
- Native support in Three.js, Babylon.js, `<model-viewer>` web component
- Draco compression reduces file size 5–10×
- LOD (Level of Detail) allows mobile devices to load a lighter mesh

**When to expose the original `.3mf`:**
- Admin panel only (for re-processing or download)
- Never served to end customers via a public URL

---

## 2. Asset pipeline — from upload to browser

### 2.1 Upload flow (admin)

```
POST /api/v1/admin/products  (multipart/form-data)
  → api-gateway validates file: max 100 MB, mime = model/3mf
  → saves original to S3: products/{productId}/original.3mf  (private bucket)
  → publishes RabbitMQ event: asset.uploaded  { productId, s3Key }
  → returns 202 Accepted  { productId, processingStatus: "pending" }
```

### 2.2 worker-service (new service in the monorepo)

Triggered by the `asset.uploaded` RabbitMQ event.

**Steps:**

| Step | Tool | Output |
|------|------|--------|
| Unzip .3mf | `adm-zip` (Node) | XML + assets in memory |
| Parse geometry | `three-stdlib` ThreeMFLoader | Three.js BufferGeometry |
| Convert to glTF | `gltf-pipeline` or `@gltf-transform/core` | .glb binary |
| Draco compress | `draco3d` (wasm) | compressed .glb |
| Generate LOD 0 (full) | gltf-transform simplify | lod0.glb (~original poly count) |
| Generate LOD 1 (medium) | gltf-transform simplify 50% | lod1.glb |
| Generate LOD 2 (low) | gltf-transform simplify 80% | lod2.glb |
| Thumbnail | `three` + `node-canvas` offscreen render | thumbnail.webp (800×800) |
| Extract bbox | parse glTF json | { width, height, depth } in mm |

**Output stored in S3 (public CDN bucket):**

```
products/{productId}/
  ├── lod0.glb          (full detail, ~1–5 MB)
  ├── lod1.glb          (medium,     ~200–800 KB)
  ├── lod2.glb          (low,        ~50–150 KB)
  ├── thumbnail.webp    (800×800,    ~30–80 KB)
  └── thumbnail_sm.webp (400×400,    ~10–30 KB)
```

**After processing, worker updates the product record:**

```typescript
// packages/domain/src/entities/Product3dAsset.ts
interface Product3dAsset {
  lodUrls: {
    lod0: string   // CDN URL
    lod1: string
    lod2: string
  }
  thumbnailUrl: string
  thumbnailSmUrl: string
  boundingBox: { widthMm: number; heightMm: number; depthMm: number }
  processingStatus: 'pending' | 'ready' | 'failed'
  processingError: string | null
}
```

### 2.3 SSE update to frontend

When processing finishes, worker publishes `asset.processed` → product-service
broadcasts SSE `product.asset_ready` so the product page updates without reload.

---

## 3. Viewer architecture

### 3.1 Technology choice

Use `@react-three/fiber` (R3F) + `@react-three/drei` — the React wrapper for Three.js.
This fits naturally in the existing React monorepo without a separate canvas framework.

```
pnpm add three @react-three/fiber @react-three/drei @types/three
pnpm add -D draco3d
```

### 3.2 Component tree

```
ProductViewer/
  ├── ProductViewer.tsx          # Root — decides: render viewer or fallback
  ├── ThreeCanvas.tsx            # R3F <Canvas> with camera + lights setup
  ├── ModelLoader.tsx            # useGLTF hook, LOD selection, Suspense boundary
  ├── ScaleReference.tsx         # Renders a 1 cm ruler gizmo in the scene
  ├── MaterialConfigurator.tsx   # Swaps mesh materials based on user selection
  ├── ViewerControls.tsx         # OrbitControls + keyboard shortcuts
  ├── ViewerHUD.tsx              # Overlay: dimensions badge, fullscreen btn, AR btn
  ├── ViewerFallback.tsx         # Static <img> shown on error or when WebGL unavailable
  └── index.ts
```

### 3.3 LOD selection logic

```typescript
// features/products/hooks/useModelLod.ts
function useModelLod(asset: Product3dAsset): string {
  const connection = useNetworkInformation()  // navigator.connection
  const isSlowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === '3g'
  const isMobile = useIsMobile()

  if (isSlowNetwork || isMobile) return asset.lodUrls.lod2
  if (isMobile) return asset.lodUrls.lod1
  return asset.lodUrls.lod0
}
```

### 3.4 Scale reference bar

The `boundingBox` values from the processing step (in mm) allow rendering a
real-world reference inside the scene:

```typescript
// ScaleReference.tsx — renders a 10 cm line with a label in the 3D scene
// Uses the glTF unit scale (1 unit = 1 mm by convention in 3MF)
// Positions the ruler at the base of the model bounding box
```

The customer can see "this object is 12 cm tall" directly in the 3D view —
no mental conversion needed.

### 3.5 WebGL availability fallback

```typescript
// ProductViewer.tsx
const webglAvailable = (() => {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
})()

if (!webglAvailable || processingStatus !== 'ready') {
  return <ViewerFallback src={asset.thumbnailUrl} alt={product.name} />
}
```

---

## 4. Product data model for 3D + customizable items

### 4.1 Extended product schema

```sql
-- New columns on the products table (migration)
ALTER TABLE products ADD COLUMN category_id        UUID REFERENCES categories(id);
ALTER TABLE products ADD COLUMN tags               TEXT[]        DEFAULT '{}';
ALTER TABLE products ADD COLUMN material_ids       UUID[]        DEFAULT '{}';
ALTER TABLE products ADD COLUMN print_time_minutes INTEGER;
ALTER TABLE products ADD COLUMN layer_height_mm    NUMERIC(4,2);
ALTER TABLE products ADD COLUMN infill_percent     SMALLINT;
ALTER TABLE products ADD COLUMN supports_required  BOOLEAN       DEFAULT FALSE;
ALTER TABLE products ADD COLUMN is_customizable    BOOLEAN       DEFAULT FALSE;
ALTER TABLE products ADD COLUMN customization_options JSONB      DEFAULT '[]';
ALTER TABLE products ADD COLUMN asset_lod0_url     TEXT;
ALTER TABLE products ADD COLUMN asset_lod1_url     TEXT;
ALTER TABLE products ADD COLUMN asset_lod2_url     TEXT;
ALTER TABLE products ADD COLUMN asset_thumbnail_url TEXT;
ALTER TABLE products ADD COLUMN bounding_box_mm    JSONB;   -- { w, h, d }
ALTER TABLE products ADD COLUMN processing_status  TEXT      DEFAULT 'none';
```

### 4.2 Customization options schema (JSONB)

```typescript
// packages/contracts/src/schemas/customizationOption.schema.ts
type CustomizationOption =
  | { type: 'color';    id: string; label: string; values: ColorValue[] }
  | { type: 'material'; id: string; label: string; values: MaterialValue[] }
  | { type: 'text';     id: string; label: string; maxLength: number; font?: string }
  | { type: 'scale';    id: string; label: string; min: number; max: number; step: number; unit: 'mm' | 'cm' }
  | { type: 'select';   id: string; label: string; values: SelectValue[] }

type ColorValue    = { id: string; label: string; hex: string; priceModifier: number }
type MaterialValue = { id: string; label: string; materialId: string; priceModifier: number }
type SelectValue   = { id: string; label: string; priceModifier: number }
```

Example stored JSON:
```json
[
  {
    "type": "color",
    "id": "body_color",
    "label": "Body color",
    "values": [
      { "id": "white",  "label": "White",  "hex": "#F5F5F5", "priceModifier": 0 },
      { "id": "black",  "label": "Black",  "hex": "#1A1A1A", "priceModifier": 0 },
      { "id": "gold",   "label": "Gold",   "hex": "#D4AF37", "priceModifier": 15 }
    ]
  },
  {
    "type": "text",
    "id": "engraving",
    "label": "Engraving text",
    "maxLength": 20
  },
  {
    "type": "scale",
    "id": "size",
    "label": "Size",
    "min": 50,
    "max": 200,
    "step": 10,
    "unit": "mm"
  }
]
```

---

## 5. Category taxonomy

### 5.1 Database schema

```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  parent_id   UUID REFERENCES categories(id),   -- null = root category
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  icon_url    TEXT,
  sort_order  SMALLINT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE materials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  properties  JSONB,   -- { heatResistant: bool, flexible: bool, foodSafe: bool, ... }
  color_hex   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Suggested category tree

```
Root
├── Decorative
│   ├── Home decor
│   ├── Wall art
│   ├── Figurines & miniatures
│   └── Jewelry & accessories
├── Functional
│   ├── Organizers & holders
│   ├── Kitchen & bathroom
│   ├── Tools & gadgets
│   └── Replacement parts
├── Personalized
│   ├── Name signs & plaques
│   ├── Portrait sculptures
│   └── Custom gifts
├── Educational
│   ├── Anatomical models
│   ├── Architectural models
│   └── STEM learning
└── Professional
    ├── Prototypes
    ├── Mechanical parts
    └── Medical & dental
```

### 5.3 Material taxonomy

```
Materials
├── Plastics
│   ├── PLA (Standard)
│   ├── PLA+ (Reinforced)
│   ├── PETG
│   ├── ABS
│   └── TPU (Flexible)
├── Resins
│   ├── Standard resin
│   ├── ABS-like resin
│   └── Castable resin
├── Composites
│   ├── Wood-fill PLA
│   ├── Metal-fill PLA
│   └── Carbon fiber PETG
└── Specialty
    ├── Glow-in-the-dark
    ├── Color-changing
    └── Food-safe PETG
```

### 5.4 Tagging strategy (complementary to categories)

Tags capture attributes that don't fit into a strict hierarchy. A product can have
many tags, enabling cross-cutting faceted search.

Tag namespaces (prefix with `namespace:`):

```
finish:matte | finish:glossy | finish:painted | finish:polished
size:miniature | size:small | size:medium | size:large | size:oversized
use:indoor | use:outdoor | use:desk | use:wall | use:wearable
difficulty:beginner | difficulty:intermediate | difficulty:advanced
theme:geometric | theme:organic | theme:industrial | theme:minimal
occasion:birthday | occasion:wedding | occasion:christmas | occasion:corporate
```

---

## 6. Search strategy

### 6.1 Search engine choice

| Option | When to use |
|--------|------------|
| PostgreSQL `tsvector` + GIN index | Up to ~50k products, no separate infra |
| **Meilisearch** (recommended) | 50k–5M products, needs fast faceted UI |
| Elasticsearch / OpenSearch | >5M products, complex analytics needs |

**Recommendation: start with PostgreSQL full-text, migrate to Meilisearch at scale.**
Meilisearch has a simple HTTP API and can be added to `docker-compose.yml` as a single
container. Drizzle syncs products to it via the RabbitMQ pipeline.

### 6.2 PostgreSQL full-text setup (phase 1)

```sql
-- Add a generated search vector column
ALTER TABLE products ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C')
  ) STORED;

CREATE INDEX products_search_vector_idx ON products USING GIN(search_vector);

-- Query example
SELECT *, ts_rank(search_vector, query) AS rank
FROM products, websearch_to_tsquery('english', $1) query
WHERE search_vector @@ query
  AND is_active = TRUE
  AND deleted_at IS NULL
ORDER BY rank DESC
LIMIT 20 OFFSET $2;
```

### 6.3 Meilisearch sync (phase 2)

```typescript
// packages/infra/search-adapter/src/MeilisearchAdapter.ts
// Listens to product.created / product.updated / product.deleted RabbitMQ events
// Indexes: { id, name, description, tags, categorySlug, materialIds, price,
//            isCustomizable, processingStatus, boundingBoxMm, createdAt }
```

### 6.4 Faceted search API contract

```typescript
// packages/contracts/src/schemas/productSearch.schema.ts
const ProductSearchQuerySchema = z.object({
  q:              z.string().optional(),
  category:       z.string().optional(),          // category slug
  materials:      z.array(z.string()).optional(),  // material slugs
  tags:           z.array(z.string()).optional(),
  minPrice:       z.number().positive().optional(),
  maxPrice:       z.number().positive().optional(),
  minWidthMm:     z.number().positive().optional(),
  maxWidthMm:     z.number().positive().optional(),
  isCustomizable: z.boolean().optional(),
  hasViewer:      z.boolean().optional(),          // processingStatus = 'ready'
  sortBy:         z.enum(['relevance','price_asc','price_desc','newest','popular']).default('relevance'),
  page:           z.number().int().positive().default(1),
  limit:          z.number().int().min(1).max(100).default(20),
})

// Response includes facet counts for UI filter panels:
type SearchResponse = {
  success: true
  data: Product[]
  meta: {
    page: number
    limit: number
    total: number
    facets: {
      categories:    FacetBucket[]  // [{ slug, name, count }]
      materials:     FacetBucket[]
      tags:          FacetBucket[]
      priceRanges:   FacetBucket[]  // [{ label:'R$0–50', min:0, max:50, count:12 }]
      customizable:  { true: number; false: number }
    }
  }
}
```

### 6.5 Frontend search UX pattern

```
SearchBar (type-ahead, debounce 300ms)
  ↓
useProductSearch hook (TanStack Query, keepPreviousData: true)
  ↓
┌─────────────────────────────────────────────┐
│  FilterPanel (left sidebar / bottom sheet)  │
│   CategoryTree   MaterialFilter             │
│   TagCloud       PriceRangeSlider           │
│   SizeRangeSlider  CustomizableToggle       │
│   HasViewerToggle  SortSelector             │
└─────────────────────────────────────────────┘
  ↓
ProductGrid (masonry on desktop, 2-col on mobile)
  ↓
ProductCard (thumbnail → hover shows 3D orbit preview)
```

**URL-driven filters** — every filter state maps to query params so results are
shareable and bookmarkable:

```
/products?q=vaso&category=decorative&materials=pla,petg&minPrice=20&sort=newest
```

---

## 7. Frontend component organization

### 7.1 New atoms

```
atoms/
  ├── Badge3d/           # "3D preview available" indicator pill
  ├── ProcessingStatus/  # Spinner/check/error for asset pipeline status
  ├── DimensionBadge/    # "12 × 8 × 5 cm" display chip
  └── MaterialChip/      # Colored chip for material display
```

### 7.2 New molecules

```
molecules/
  ├── ProductCard3d/         # ProductCard extended: thumbnail + hover-to-orbit
  ├── FilterPanel/           # Collapsible facet filter container
  ├── CategoryTree/          # Recursive tree navigator for categories
  ├── TagCloud/              # Clickable tag pills with count badges
  ├── PriceRangeSlider/      # Dual-handle range input
  ├── SizeRangeSlider/       # mm range for bounding box filter
  ├── CustomizationPanel/    # Renders dynamic options from customization_options JSON
  ├── MaterialSelector/      # Grid of material chips with color swatches
  └── SearchSuggestions/     # Dropdown with grouped suggestions (products + categories)
```

### 7.3 New organisms

```
organisms/
  ├── ProductViewer/         # Full 3D viewer (see Section 3)
  ├── ProductConfigurator/   # Combines ProductViewer + CustomizationPanel + price calc
  ├── SearchResultsGrid/     # Masonry grid with infinite scroll or pagination
  ├── FilterSidebar/         # Desktop left-panel with all facet filters
  ├── FilterDrawer/          # Mobile bottom sheet version of FilterSidebar
  └── CategoryBrowser/       # Visual category tiles for homepage
```

### 7.4 New pages

```
pages/
  ├── ProductDetailPage/     # Viewer + configurator + WhatsApp CTA
  ├── SearchResultsPage/     # Full search with filters
  ├── CategoryPage/          # Category landing (SEO-optimized)
  └── AdminProductFormPage/  # Extended form: 3MF upload + customization options builder
```

### 7.5 Feature: products — extended structure

```
features/products/
  ├── api/
  │   ├── products.api.ts        # Existing endpoints
  │   └── search.api.ts          # Search + facets endpoint
  ├── hooks/
  │   ├── useProducts.ts         # Existing
  │   ├── useProductSearch.ts    # NEW: search with facets, URL-synced
  │   ├── useProductDetail.ts    # Existing
  │   ├── useProductSSE.ts       # Existing
  │   ├── useModelLod.ts         # NEW: LOD URL selection
  │   └── useConfigurator.ts     # NEW: manages customization state + price calc
  ├── store/
  │   └── configuratorStore.ts   # NEW: selected options, calculated price
  └── types/
      ├── Product.ts             # Extended with 3D fields
      ├── Category.ts            # NEW
      ├── Material.ts            # NEW
      └── CustomizationOption.ts # NEW
```

---

## 8. Image and asset best practices

### 8.1 Thumbnail generation rules

| Variant | Size | Format | Use |
|---------|------|--------|-----|
| `thumbnail_sm` | 400×400 | WebP (q80) | Product cards, search results |
| `thumbnail` | 800×800 | WebP (q85) | Product detail fallback, OG image |
| `thumbnail_xl` | 1200×1200 | WebP (q90) | Lightbox, zoom |

All thumbnails: white background, model centered, isometric 30° camera angle,
soft directional light, ambient occlusion baked in the render.

### 8.2 Serving images

- All thumbnails served via CDN (Cloudflare R2 / CloudFront)
- Use `srcset` + `sizes` on every `<img>`:
  ```html
  <img
    src="/cdn/products/abc/thumbnail_sm.webp"
    srcset="
      /cdn/products/abc/thumbnail_sm.webp 400w,
      /cdn/products/abc/thumbnail.webp    800w
    "
    sizes="(max-width: 640px) 50vw, 300px"
    loading="lazy"
    decoding="async"
    alt="Product name — front view"
  />
  ```
- Never use `<img src="data:...">` for product images (breaks caching)
- Never inline `.glb` files as base64

### 8.3 3D asset serving

- All `.glb` files: `Cache-Control: public, max-age=31536000, immutable`
  (filename includes a content hash suffix set at processing time)
- Preload the selected LOD when the product card enters the viewport:
  ```typescript
  // In ProductCard3d — trigger LOD preload on hover / intersection
  useGLTF.preload(lodUrl)
  ```
- Never load LOD0 on the product listing page — only LOD2 for the hover preview

### 8.4 Progressive loading UX

```
1. Server renders page with static thumbnail (WebP)         → paint in <50ms
2. Intersection Observer detects product detail in viewport  → start loading glTF
3. Draco geometry arrives → show spinner in canvas           → <1s on 4G
4. Mesh renders with default material                        → interactive
5. Textures stream in                                        → full quality
```

---

## 9. Performance budget

| Metric | Target | How |
|--------|--------|-----|
| LCP (product list) | < 2.0s | WebP thumbnails, CDN, lazy load below fold |
| LCP (product detail) | < 2.5s | SSR thumbnail + async viewer load |
| 3D viewer interactive | < 1.5s on 4G | LOD2 = ~100 KB, Draco compressed |
| 3D viewer interactive | < 0.5s on WiFi | LOD0 preloaded on hover |
| JS bundle (viewer chunk) | < 200 KB gzip | R3F tree-shaking, dynamic import |
| CLS | < 0.1 | Reserve canvas dimensions before load |
| WebGL context limit | max 8 simultaneous | SSEManager pattern for canvas pool |

**Lazy load the entire viewer chunk:**
```typescript
const ProductViewer = React.lazy(() => import('@/organisms/ProductViewer'))
```

**Canvas pool** — browsers limit active WebGL contexts to ~8. On the product list page
each card hover creates a canvas; destroy it on mouse-leave:

```typescript
// Use @react-three/drei <View> with a single shared canvas for the whole page
// Each card renders into a portal — one WebGL context for N cards
```

---

## 10. Backend additions required

### New services / packages

| Addition | Location | Purpose |
|----------|----------|---------|
| `apps/worker-service` | New app | Processes uploaded .3mf files |
| `packages/infra/storage-adapter` | New package | S3/R2 client (presigned URLs, upload, delete) |
| `packages/infra/search-adapter` | New package | Meilisearch sync client |
| `packages/infra/image-adapter` | New package | WebP thumbnail generation (sharp) |

### New tables

- `categories` — hierarchical category tree
- `materials` — material catalog
- `product_assets` — processing status + all CDN URLs (or columns on `products`)

### New RabbitMQ events

```
asset.uploaded           → triggers worker-service processing
asset.processing_started → SSE to admin panel
asset.processed          → updates DB, SSE to product page
asset.failed             → logs error, updates DB, SSE alert
```

### New API endpoints

```
GET  /api/v1/products/search          full-text + faceted search
GET  /api/v1/categories               category tree
GET  /api/v1/categories/:slug/products products in category
GET  /api/v1/materials                material catalog
POST /api/v1/admin/products/:id/upload-model  multipart .3mf upload
GET  /api/v1/admin/products/:id/asset-status  processing status (SSE-compatible)
```

---

## 11. Implementation checklist

### Phase 1 — Foundation (no 3D yet)

- [ ] Add `categories` and `materials` tables + migrations
- [ ] Extend `products` schema with category, tags, materials, customization fields
- [ ] Implement PostgreSQL full-text search endpoint with facets
- [ ] Build `FilterPanel`, `CategoryTree`, `TagCloud`, `PriceRangeSlider` molecules
- [ ] Build `SearchResultsPage` with URL-synced filters
- [ ] Build `CustomizationPanel` organism (renders dynamic options)
- [ ] Add `useProductSearch` hook with facet support
- [ ] Seed categories and materials

### Phase 2 — Asset pipeline

- [ ] Create `packages/infra/storage-adapter` (S3/R2 + presigned URL)
- [ ] Create `apps/worker-service` with RabbitMQ consumer
- [ ] Implement .3mf → glTF conversion (three-stdlib + gltf-transform)
- [ ] Implement LOD generation (3 levels)
- [ ] Implement WebP thumbnail render (node-canvas + Three.js)
- [ ] Extract bounding box and store in DB
- [ ] Expose upload endpoint in admin-service
- [ ] Admin panel: file upload UI + processing status indicator

### Phase 3 — 3D viewer

- [ ] Install `@react-three/fiber` + `@react-three/drei`
- [ ] Build `ProductViewer` organism (canvas + controls + fallback)
- [ ] Build `ScaleReference` (real-world ruler gizmo)
- [ ] Build `MaterialConfigurator` (color/material swap in scene)
- [ ] Build `LOD manager` hook
- [ ] Integrate viewer into `ProductDetailPage`
- [ ] Add canvas pool for product list hover previews
- [ ] Add WebGL capability detection + graceful fallback

### Phase 4 — Search upgrade

- [ ] Add Meilisearch to `docker-compose.yml`
- [ ] Create `packages/infra/search-adapter`
- [ ] Sync products to Meilisearch via RabbitMQ consumer
- [ ] Migrate search endpoint from PostgreSQL FTS to Meilisearch
- [ ] Add type-ahead suggestions endpoint
- [ ] Add ADR documenting the FTS → Meilisearch migration decision

---

## ADR references to create

- `ADR-007`: Why glTF over direct .3mf rendering
- `ADR-008`: Why Meilisearch over PostgreSQL full-text at scale
- `ADR-009`: Why R3F (@react-three/fiber) over vanilla Three.js
- `ADR-010`: LOD strategy and performance budget rationale
- `ADR-011`: Category taxonomy design (flat tags vs strict hierarchy vs hybrid)
