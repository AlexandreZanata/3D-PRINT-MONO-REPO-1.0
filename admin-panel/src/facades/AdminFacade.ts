import { coerceJsonValue } from "@/lib/jsonValue";
import type { AuditLog, AuditLogList } from "@/features/admin/types";

export interface ApiAuditLog {
  readonly id: string;
  readonly adminId: string;
  readonly action: string;
  readonly entity: string;
  readonly entityId: string;
  readonly payload: unknown;
  readonly ip: string;
  readonly ua: string;
  readonly createdAt: string;
}

export function toAuditLog(raw: ApiAuditLog): AuditLog {
  return {
    id: raw.id,
    adminId: raw.adminId,
    action: raw.action,
    entity: raw.entity,
    entityId: raw.entityId,
    payload: coerceJsonValue(raw.payload),
    ip: raw.ip,
    ua: raw.ua,
    createdAt: raw.createdAt,
  };
}

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
