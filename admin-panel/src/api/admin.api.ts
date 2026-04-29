import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import { toAuditLogList } from "@/facades/AdminFacade";
import type { ApiAuditLog } from "@/facades/AdminFacade";
import type { AuditLogList } from "@/features/admin/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: { page: number; limit: number; total: number };
}

export async function adminFetchAuditLogs(page = 1, limit = 50): Promise<AuditLogList> {
  const { data } = await httpClient.get<ApiEnvelope<ApiAuditLog[]>>(ENDPOINTS.ADMIN_AUDIT_LOGS, {
    params: { page, limit },
  });
  return toAuditLogList(data.data, {
    page: data.meta?.page ?? page,
    limit: data.meta?.limit ?? limit,
    total: data.meta?.total ?? 0,
  });
}
