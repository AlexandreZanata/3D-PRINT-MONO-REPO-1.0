import { Spinner } from "@/atoms/Spinner/Spinner";
import type { Product } from "@/features/products/types";

interface ProductDetailProps {
  product: Product | undefined;
  isLoading?: boolean;
  onWhatsApp?: () => void;
}

/**
 * ProductDetail organism — full product detail view.
 * Receives data via props. onWhatsApp callback opens the wa.me link.
 */
export function ProductDetail({ product, isLoading = false, onWhatsApp }: ProductDetailProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" label="Loading product…" />
      </div>
    );
  }

  if (!product) {
    return (
      <p className="text-center text-muted-foreground py-24 text-sm">Product not found.</p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-16">
      <div className="aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-surface">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="eager"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      <div className="md:py-6">
        <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
          {product.name}
        </h1>
        <p className="mt-6 text-2xl tabular-nums">${product.price.toFixed(2)}</p>
        <p className="mt-6 text-[15px] leading-relaxed text-foreground/80 max-w-md">
          {product.description}
        </p>

        {onWhatsApp && (
          <button
            type="button"
            onClick={onWhatsApp}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground text-background h-12 px-6 text-sm hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
          >
            Buy via WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}
