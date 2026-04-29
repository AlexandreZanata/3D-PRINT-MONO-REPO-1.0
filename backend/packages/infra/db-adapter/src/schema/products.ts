// @max-lines 200 — this is enforced by the lint pipeline.
import { sql } from "drizzle-orm";
import { boolean, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * DB-level UUID default via uuid-ossp (available in all PostgreSQL versions).
 * The application always supplies IDs explicitly via Node.js crypto.randomUUID().
 * This default is a safety net only.
 */
const uuidDefault = sql`uuid_generate_v4()`;

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().default(uuidDefault),
  name: text("name").notNull(),
  slug: text("slug"),
  tagline: text("tagline").notNull().default(""),
  category: text("category").notNull().default("Decor"),
  material: text("material").notNull().default(""),
  dimensions: text("dimensions").notNull().default(""),
  description: text("description").notNull(),
  // numeric stored as string by postgres driver; parse to number in repo layer
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stock: numeric("stock", { precision: 10, scale: 0 }).notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  imageUrl: text("image_url"),
  // JSON array of image URL strings; first element is the primary image
  images: jsonb("images").notNull().default(sql`'[]'::jsonb`),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type ProductSelectModel = typeof productsTable.$inferSelect;
export type ProductInsertModel = typeof productsTable.$inferInsert;
