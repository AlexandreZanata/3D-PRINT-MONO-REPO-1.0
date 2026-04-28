// MIGRATED FROM: src/components/SiteChrome.tsx (MobileTabBar export) — atomic design structure
import { Link, useLocation } from "@tanstack/react-router";
import { Search, ShoppingBag, Home, Grid2x2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/features/cart/useCart";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/organisms/SearchDialog/SearchDialog";

export function MobileTabBar() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const tabs = [
    { to: "/", icon: Home, label: "Home", exact: true },
    { to: "/shop", icon: Grid2x2, label: "Shop", exact: false },
    { to: "search", icon: Search, label: "Search", exact: false },
    { to: "/cart", icon: ShoppingBag, label: "Cart", exact: false, badge: count },
  ] as const;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border safe-bottom">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.to === "search"
                ? false
                : tab.exact
                  ? pathname === tab.to
                  : pathname.startsWith(tab.to);

            const inner = (
              <span className="relative flex flex-col items-center justify-center gap-1">
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                {"badge" in tab && tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "text-[10px] tracking-wide",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tab.label}
                </span>
              </span>
            );

            if (tab.to === "search") {
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center justify-center active:scale-95 transition-transform"
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link
                key={tab.label}
                to={tab.to}
                className="flex items-center justify-center active:scale-95 transition-transform"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
