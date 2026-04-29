-- Migration 00001: add rich product fields and site_settings table
-- Adds slug, tagline, category, material, dimensions, images to products.
-- Creates site_settings key-value table for admin-editable page content.

-- ── Products: new columns ────────────────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slug        TEXT,
  ADD COLUMN IF NOT EXISTS tagline     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category    TEXT NOT NULL DEFAULT 'Decor',
  ADD COLUMN IF NOT EXISTS material    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS dimensions  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS images      JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Unique index on slug (non-null slugs must be unique)
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique
  ON products (slug)
  WHERE slug IS NOT NULL AND deleted_at IS NULL;

-- ── Site settings ─────────────────────────────────────────────────────────────
-- Generic key-value store for admin-editable site content.
-- key examples: hero.headline, hero.subheadline, hero.imageUrl, hero.ctaLabel,
--               hero.ctaLink, hero.badgeText, footer.copyright
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('hero.badgeText',    'Studio · 2026 collection'),
  ('hero.headline',     'Objects, printed\nin quiet detail.'),
  ('hero.subheadline',  'Sculptural homeware, additively manufactured in our studio. Made to order, finished by hand, shipped in recyclable packaging.'),
  ('hero.imageUrl',     ''),
  ('hero.ctaLabel',     'Shop the collection'),
  ('hero.ctaLink',      '/shop'),
  ('hero.secondaryLabel', 'Lighting'),
  ('hero.secondaryLink',  '/shop?category=Lighting'),
  ('featured.title',    'Newly in the studio'),
  ('featured.badge',    'Featured'),
  ('story.card1.title', 'Made to order'),
  ('story.card1.body',  'Every piece is printed when you order it. No overstock, minimal waste, ships in 5–7 days.'),
  ('story.card2.title', 'Hand finished'),
  ('story.card2.body',  'Sanded, sealed, and inspected in our studio before each piece leaves us.'),
  ('story.card3.title', 'Plant-based PLA'),
  ('story.card3.body',  'We print primarily in compostable, plant-derived PLA. Recyclable packaging, always.'),
  ('footer.copyright',  '© 2026 Forma Studio. All rights reserved.')
ON CONFLICT (key) DO NOTHING;
