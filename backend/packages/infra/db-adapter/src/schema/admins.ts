// @max-lines 200 — this is enforced by the lint pipeline.
import { sql } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const uuidv7Default = sql`uuid_generate_v7()`;

export const adminRoleEnum = pgEnum("admin_role", ["admin", "super_admin"]);

export const adminsTable = pgTable("admins", {
  id: uuid("id").primaryKey().default(uuidv7Default),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export type AdminSelectModel = typeof adminsTable.$inferSelect;
export type AdminInsertModel = typeof adminsTable.$inferInsert;
