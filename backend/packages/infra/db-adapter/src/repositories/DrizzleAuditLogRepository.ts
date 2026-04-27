// @max-lines 200 — this is enforced by the lint pipeline.
import type { AuditLogRecord, IAuditLogRepository, PaginatedResult, PaginationOptions } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import { count, desc } from "drizzle-orm";
import type { DbClient } from "../client.js";
import { auditLogsTable } from "../schema/index.js";

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: DbClient) {}

  async save(record: AuditLogRecord): Promise<Result<void, InfraError>> {
    try {
      await this.db.insert(auditLogsTable).values({
        id: record.id,
        admin_id: record.adminId,
        action: record.action,
        entity: record.entity,
        entity_id: record.entityId,
        payload: record.payload,
        ip: record.ip,
        ua: record.ua,
        created_at: record.createdAt,
      });
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("save failed", toError(e), "DB_ERROR"));
    }
  }

  async findAll(
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedResult<AuditLogRecord>, InfraError>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(auditLogsTable)
          .orderBy(desc(auditLogsTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.db.select({ total: count() }).from(auditLogsTable),
      ]);

      return ok({
        items: rows.map(toRecord),
        total: Number(countRow?.total ?? 0),
        page: pagination.page,
        limit: pagination.limit,
      });
    } catch (e) {
      return err(new InfraError("findAll failed", toError(e), "DB_ERROR"));
    }
  }
}

function toRecord(row: typeof auditLogsTable.$inferSelect): AuditLogRecord {
  return {
    id: row.id,
    adminId: row.adminId,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    // jsonb comes back as Record<string, unknown> already
    payload: row.payload as Record<string, unknown>,
    ip: row.ip,
    ua: row.ua,
    createdAt: row.createdAt,
  };
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
