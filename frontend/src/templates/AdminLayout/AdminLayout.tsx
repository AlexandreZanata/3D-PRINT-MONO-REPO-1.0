import type { ReactNode } from "react";
import { AdminSidebar } from "@/organisms/AdminSidebar/AdminSidebar";
import { useLocation } from "@tanstack/react-router";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * AdminLayout template — sidebar + topbar + main content area.
 * Defines the slot structure for all admin pages.
 * No data fetching — receives children via props.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-14 flex items-center justify-between">
          <a href="/" className="font-display text-xl">
            Forma <span className="text-muted-foreground text-sm font-sans">Admin</span>
          </a>
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to shop
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 flex gap-8">
        <AdminSidebar currentPath={pathname} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
