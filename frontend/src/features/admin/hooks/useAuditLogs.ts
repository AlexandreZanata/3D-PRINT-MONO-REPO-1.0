import { useQuery } from "@tanstack/react-query";
import { adminFetchAuditLogs } from "@/api/admin.api";
import type { AuditLogList } from "../types";

export const AUDIT_LOG_QUERY_KEYS = {
  list: (page: number, limit: number) => ["admin", "audit-logs", page, limit] as const,
} as const;

/**
 * Fetches paginated audit logs for the admin panel.
 * Stale time: 0 — audit logs are always fresh.
 */
export function useAuditLogs(page = 1, limit = 20): {
  data: AuditLogList | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.list(page, limit),
    queryFn: () => adminFetchAuditLogs(page, limit),
    staleTime: 0,
  });
  return { data, isLoading };
}
