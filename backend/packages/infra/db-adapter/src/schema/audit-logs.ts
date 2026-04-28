// @max-lines 200 — this is enforced by the lint pipeline.
import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { adminsTable } from "./admins.js";

/**
 * DB-level UUID default via uuid-ossp.
 * The application always supplies IDs explicitly via Node.js crypto.randomUUID().
 */
const uuidDefault = sql`uuid_generate_v4()`;

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(uuidDefault),
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
