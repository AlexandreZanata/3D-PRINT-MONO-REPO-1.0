# ADR 0004: Storefront CSS and font loading (FOUC)

## Status

Accepted

## Context

The storefront uses Tailwind v4 via a bundled stylesheet injected with SSR. A blocking **Google Fonts** stylesheet in `<head>` could delay first paint of layout utilities. Multiple async CSS chunks can also cause a short **flash of unstyled content** before all rules apply.

## Decision

1. **Vite build** — Use `build.cssCodeSplit: false` so production HTML references a **single** CSS asset, avoiding staggered chunk paints.

2. **Document order** — Emit **critical inline** rules first (design tokens, body, and `.forma-shell` layout mirroring the root flex column), then **HeadContent** (app stylesheet), then **Google Fonts** loaded as `media="print"` with **`onLoad` switching to `all`** so font CSS does not block the main stylesheet. **`noscript`** retains a blocking fallback.

## Consequences

- First paint keeps background, text color, and shell layout without waiting for Google Fonts.
- Fonts may apply slightly after the first paint; `display=swap` in the font URL limits invisible text duration.
