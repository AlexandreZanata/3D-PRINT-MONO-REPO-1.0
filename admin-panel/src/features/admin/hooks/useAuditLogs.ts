import { useQuery } from "@tanstack/react-query";
import { adminFetchAuditLogs } from "@/api/admin.api";

export const AUDIT_LOG_QUERY_KEYS = {
  list: (page: number, limit: number) => ["admin", "audit-logs", page, limit] as const,
} as const;

export function useAuditLogs(page = 1, limit = 50) {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.list(page, limit),
    queryFn: () => adminFetchAuditLogs(page, limit),
    staleTime: 30 * 1000,
  });
}
