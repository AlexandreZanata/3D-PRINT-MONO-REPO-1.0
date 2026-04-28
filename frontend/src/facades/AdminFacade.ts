import type { AuditLog, AuditLogList } from "@/features/admin/types";

/**
 * Raw API shapes for the admin feature.
 */
export interface ApiAuditLog {
  readonly id: string;
  readonly adminId: string;
  readonly action: string;
  readonly entity: string;
  readonly entityId: string;
  readonly payload: Record<string, unknown>;
  readonly ip: string;
  readonly ua: string;
  readonly createdAt: string;
}

/**
 * Maps a raw API audit log entry to the frontend AuditLog domain type.
 * Currently a direct mapping — exists to decouple the API shape from the UI type.
 */
export function toAuditLog(raw: ApiAuditLog): AuditLog {
  return {
    id: raw.id,
    adminId: raw.adminId,
    action: raw.action,
    entity: raw.entity,
    entityId: raw.entityId,
    payload: raw.payload,
    ip: raw.ip,
    ua: raw.ua,
    createdAt: raw.createdAt,
  };
}

/**
 * Maps an array of raw API audit log entries to an AuditLogList.
 */
export function toAuditLogList(
  raw: ApiAuditLog[],
  meta: { page: number; limit: number; total: number },
): AuditLogList {
  return {
    items: raw.map(toAuditLog),
    page: meta.page,
    limit: meta.limit,
    total: meta.total,
  };
}
