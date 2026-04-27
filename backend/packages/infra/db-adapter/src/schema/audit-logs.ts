// @max-lines 200 — this is enforced by the lint pipeline.
import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { adminsTable } from "./admins.js";

/** Native PostgreSQL 18.1+ UUIDv7 (no extension required). */
const uuidv7Default = sql`gen_random_uuid_v7()`;

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(uuidv7Default),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminsTable.id, { onDelete: "restrict" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  payload: jsonb("payload").notNull(),
  ip: text("ip").notNull(),
  ua: text("ua").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLogSelectModel = typeof auditLogsTable.$inferSelect;
export type AuditLogInsertModel = typeof auditLogsTable.$inferInsert;
