import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ProductCard } from "@/molecules/ProductCard/ProductCard";
import { useProducts } from "@/features/products/hooks/useProducts";
import { cn } from "@/lib/utils";

const CATEGORY_VALUES = ["All", "Decor", "Lighting", "Tableware", "Games", "Office"] as const;
type CategoryValue = (typeof CATEGORY_VALUES)[number];

const searchSchema = z.object({
  category: fallback(z.enum(CATEGORY_VALUES), "All").default("All"),
  sort: fallback(z.enum(["featured", "price-asc", "price-desc"]), "featured").default("featured"),
});

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Shop — Forma" },
      { name: "description", content: "Browse the Forma collection of sculptural 3D printed objects." },
      { property: "og:title", content: "Shop — Forma" },
      { property: "og:description", content: "Browse the Forma collection of sculptural 3D printed objects." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category, sort } = Route.useSearch();
  const { data: productList, isLoading } = useProducts({
    isActive: true,
    limit: 100,
    ...(category !== "All" ? { category } : {}),
  });

  const products = useMemo(() => {
    const list = productList?.items ?? [];
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [productList, sort]);

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-8 md:pt-14 pb-16 md:pb-24">
      <div className="mb-8 md:mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">The collection</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight">Shop everything</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-8 md:mb-12 sticky top-16 z-20 bg-background/85 backdrop-blur-md py-3 -mx-5 px-5 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none border-b border-border md:border-0">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {CATEGORY_VALUES.map((c) => {
            const active = category === c;
            return (
              <Link
                key={c}
                to="/shop"
                search={(prev) => ({ ...prev, category: c as CategoryValue })}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-sm transition-colors border",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-border-strong",
                )}
              >
                {c}
              </Link>
            );
          })}
        </div>

        <select
          value={sort}
          onChange={(e) => {
            const v = e.target.value as "featured" | "price-asc" | "price-desc";
            const url = new URL(window.location.href);
            url.searchParams.set("sort", v);
            window.history.replaceState(null, "", url.toString());
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="hidden md:block bg-transparent text-sm border border-border rounded-full px-3 py-1.5 outline-none focus:border-border-strong"
          aria-label="Sort products"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
