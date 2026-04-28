import { ProductCard } from "@/molecules/ProductCard/ProductCard";
import { Spinner } from "@/atoms/Spinner/Spinner";
import type { Product } from "@/features/products/types";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * ProductGrid organism — renders a responsive grid of ProductCard molecules.
 * Receives data via props only — no API calls inside.
 */
export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading products…" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16 text-sm">
        No products found.
      </p>
    );
  }

  // Map backend Product to the shape ProductCard expects from lib/products
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
      {products.map((p) => (
        <div key={p.id} className="animate-fade-up">
          <div className="aspect-[4/5] mb-4 rounded-xl overflow-hidden bg-surface">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl leading-tight truncate">{p.name}</h3>
            <p className="text-sm tabular-nums tracking-tight shrink-0">
              ${p.price.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
