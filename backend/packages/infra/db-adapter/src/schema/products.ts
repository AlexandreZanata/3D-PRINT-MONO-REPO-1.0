// @max-lines 200 — this is enforced by the lint pipeline.
import { sql } from "drizzle-orm";
import { boolean, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Native PostgreSQL 18.1+ UUIDv7 default.
 * Uses gen_random_uuid_v7() built-in function (no extension required).
 */
const uuidv7Default = sql`gen_random_uuid_v7()`;

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().default(uuidv7Default),
  name: text("name").notNull(),
  description: text("description").notNull(),
  // numeric stored as string by postgres driver; parse to number in repo layer
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stock: numeric("stock", { precision: 10, scale: 0 }).notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type ProductSelectModel = typeof productsTable.$inferSelect;
export type ProductInsertModel = typeof productsTable.$inferInsert;
