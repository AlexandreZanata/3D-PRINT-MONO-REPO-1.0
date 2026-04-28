// MIGRATED FROM: src/components/SiteChrome.tsx (SiteHeader export) — atomic design structure
import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/features/cart/useCart";
import { SearchDialog } from "@/organisms/SearchDialog/SearchDialog";

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
