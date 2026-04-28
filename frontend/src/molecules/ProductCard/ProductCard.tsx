// MIGRATED FROM: src/components/ProductCard.tsx — moved to comply with atomic design structure
import { Link } from "@tanstack/react-router";
import { ProductCarousel } from "@/molecules/ProductCarousel/ProductCarousel";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block animate-fade-up"
    >
      <div className="aspect-[4/5] mb-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
        <ProductCarousel images={product.images} alt={product.name} className="h-full" />
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
