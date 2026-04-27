// @max-lines 200 — this is enforced by the lint pipeline.
import { sql } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Custom UUIDv7 default — calls the pg_uuidv7 extension function.
 * The extension must be enabled via the bootstrap migration.
 */
const uuidv7Default = sql`uuid_generate_v7()`;

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
