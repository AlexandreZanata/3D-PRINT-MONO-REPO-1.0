import { createFileRoute } from "@tanstack/react-router";
import { useAuditLogs } from "@/features/admin/hooks/useAuditLogs";
import { formatAuditDate } from "@/lib/formatDate";

export const Route = createFileRoute("/_admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Forma Admin" }] }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const { data, isLoading } = useAuditLogs(1, 50);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Every admin action is recorded here.</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit logs yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <p className="text-xs text-muted-foreground px-4 py-2 border-b border-border">{total} entries</p>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entity</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                    {formatAuditDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground capitalize">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.entity}
                    <span className="ml-1 font-mono text-xs opacity-60">{log.entityId.slice(0, 8)}…</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
