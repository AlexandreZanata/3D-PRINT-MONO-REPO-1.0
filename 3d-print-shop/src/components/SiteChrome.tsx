import { Link, useLocation } from "@tanstack/react-router";
import { Search, ShoppingBag, Home, Grid2x2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./SearchDialog";

export function SiteHeader() {
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="font-display text-2xl tracking-tight leading-none">
            forma<span className="text-muted-foreground">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" activeOptions={{ exact: true }} className="hover:opacity-60 transition-opacity" activeProps={{ className: "font-medium" }}>
              Home
            </Link>
            <Link to="/shop" className="hover:opacity-60 transition-opacity" activeProps={{ className: "font-medium" }}>
              Shop
            </Link>
            <Link to="/shop" search={{ category: "Decor" }} className="hover:opacity-60 transition-opacity">
              Decor
            </Link>
            <Link to="/shop" search={{ category: "Lighting" }} className="hover:opacity-60 transition-opacity">
              Lighting
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to="/cart"
              aria-label="Cart"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-secondary transition-colors relative"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] font-medium tabular-nums flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

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
