import { createFileRoute } from "@tanstack/react-router";
import { useAuditLogs } from "@/features/admin/hooks/useAuditLogs";
import { formatDateTime } from "@/lib/formatDate";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Forma Admin" }] }),
  component: AdminAuditLogPage,
});

function AdminAuditLogPage() {
  const { data, isLoading } = useAuditLogs();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading audit logs…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Audit logs</h1>

      {!data || data.items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No audit logs yet.</p>
      ) : (
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
              {data.items.map((log) => (
                <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3">
                    {log.entity} <span className="text-muted-foreground">{log.entityId.slice(0, 8)}…</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
