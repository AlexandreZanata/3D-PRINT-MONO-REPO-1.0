// @max-lines 200 — this is enforced by the lint pipeline.
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { adminsTable } from "./admins.js";

/**
 * DB-level UUID default via uuid-ossp.
 * The application always supplies IDs explicitly via Node.js crypto.randomUUID().
 */
const uuidDefault = sql`uuid_generate_v4()`;

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().default(uuidDefault),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminsTable.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  familyId: uuid("family_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

export type RefreshTokenSelectModel = typeof refreshTokensTable.$inferSelect;
export type RefreshTokenInsertModel = typeof refreshTokensTable.$inferInsert;
