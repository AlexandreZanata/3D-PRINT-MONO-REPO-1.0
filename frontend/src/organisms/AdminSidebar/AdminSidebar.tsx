import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface AdminSidebarProps {
  currentPath: string;
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Products", href: "/admin/products" },
  { label: "Audit logs", href: "/admin/audit-logs" },
];

/**
 * AdminSidebar organism — navigation sidebar for the admin panel.
 * Highlights the active route based on currentPath.
 */
export function AdminSidebar({ currentPath, className }: AdminSidebarProps) {
  return (
    <aside className={cn("w-56 shrink-0", className)}>
      <nav aria-label="Admin navigation">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath.startsWith(item.href);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
