// MIGRATED FROM: src/components/ProductCard.tsx — moved to comply with atomic design structure
import { Link } from "@tanstack/react-router";
import { ProductCarousel } from "@/molecules/ProductCarousel/ProductCarousel";
import type { Product } from "@/features/products/types";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents);
}

export function ProductCard({ product }: { product: Product }) {
  // Navigate by slug when available, fall back to id
  const slugOrId = product.slug ?? product.id;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: slugOrId }}
      className="group block animate-fade-up"
    >
      <div className="aspect-[4/5] mb-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
        <ProductCarousel images={[...product.images]} alt={product.name} className="h-full" />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.tagline}</p>
        </div>
        <p className="text-sm tabular-nums tracking-tight shrink-0">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
