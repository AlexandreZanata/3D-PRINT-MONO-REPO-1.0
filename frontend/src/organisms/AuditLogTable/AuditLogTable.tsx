import { formatDateTime } from "@/lib/formatDate";
import type { AuditLog } from "@/features/admin/types";

interface AuditLogTableProps {
  logs: AuditLog[];
}

/**
 * AuditLogTable organism — tabular list of audit log entries.
 * Receives data via props — no API calls inside.
 */
export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">No audit logs yet.</p>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 font-medium">When</th>
            <th className="text-left px-4 py-3 font-medium">Action</th>
            <th className="text-left px-4 py-3 font-medium">Entity</th>
            <th className="text-left px-4 py-3 font-medium">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                {formatDateTime(log.createdAt)}
              </td>
              <td className="px-4 py-3 font-medium">{log.action}</td>
              <td className="px-4 py-3">
                {log.entity}{" "}
                <span className="text-muted-foreground text-xs">
                  {log.entityId.slice(0, 8)}…
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
