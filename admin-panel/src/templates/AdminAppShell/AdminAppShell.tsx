import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { LayoutGrid, Settings, ClipboardList, LogOut, Package } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/products", label: "Products", icon: Package },
  { to: "/site-settings", label: "Site settings", icon: Settings },
  { to: "/audit-logs", label: "Audit logs", icon: ClipboardList },
] as const;

export function AdminAppShell() {
  const { adminUser } = useAuthStore(useShallow((s) => ({ adminUser: s.adminUser })));
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        void navigate({ to: "/login" });
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
          <span className="font-semibold text-sm tracking-wide">Forma Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              inactiveProps={{
                className:
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2 text-xs text-sidebar-foreground/50 truncate">{adminUser?.email}</div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={logout.isPending}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              "transition-colors disabled:opacity-50",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-6 bg-card">
          <LayoutGrid className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
