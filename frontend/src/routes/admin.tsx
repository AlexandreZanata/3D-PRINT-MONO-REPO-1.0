import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

/**
 * Admin layout route — parent for all /admin/* routes.
 * beforeLoad enforces authentication + admin role for every child route.
 * Lazy-loads child page content via Outlet.
 */
export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const { isAuthenticated, adminUser } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    if (adminUser?.role !== "admin") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-14 flex items-center justify-between">
          <span className="font-display text-xl">Forma Admin</span>
          <div className="flex items-center gap-6 text-sm">
            <a href="/admin/products" className="hover:opacity-60 transition-opacity">
              Products
            </a>
            <a href="/admin/site-settings" className="hover:opacity-60 transition-opacity">
              Site settings
            </a>
            <a href="/admin/audit-logs" className="hover:opacity-60 transition-opacity">
              Audit logs
            </a>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-5 md:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
