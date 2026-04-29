import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { ProductCarousel } from "@/molecules/ProductCarousel/ProductCarousel";
import { ProductCard } from "@/molecules/ProductCard/ProductCard";
import { useCart } from "@/features/cart/useCart";
import { useProducts } from "@/features/products/hooks/useProducts";
import { fetchProductBySlug } from "@/api/products.api";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Forma" }] };
    const primaryImage = p.images[0] ?? p.imageUrl ?? "";
    return {
      meta: [
        { title: `${p.name} — Forma` },
        { name: "description", content: p.tagline },
        { property: "og:title", content: `${p.name} — Forma` },
        { property: "og:description", content: p.tagline },
        ...(primaryImage ? [
          { property: "og:image", content: primaryImage },
          { name: "twitter:image", content: primaryImage },
        ] : []),
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-display text-4xl mb-3">Not found</h1>
      <p className="text-muted-foreground mb-6">This product is no longer available.</p>
      <Link to="/shop" className="underline underline-offset-4">Back to shop</Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Fetch related products from the same category
  const { data: relatedList } = useProducts({
    category: product.category,
    isActive: true,
    limit: 10,
  });
  const related = (relatedList?.items ?? [])
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    add(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  // Merge images array with imageUrl fallback for display
  const displayImages = product.images.length > 0
    ? [...product.images]
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-6 md:pt-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-12 grid md:grid-cols-2 gap-8 md:gap-16">
        <div className="animate-fade-in">
          <div className="aspect-square md:aspect-[4/5]">
            <ProductCarousel
              images={displayImages}
              alt={product.name}
              className="h-full"
              priority
            />
          </div>
        </div>

        <div className="md:py-6 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            {product.category}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
            {product.name}
          </h1>
          {product.tagline && (
            <p className="mt-3 text-lg text-muted-foreground italic">{product.tagline}</p>
          )}

          <p className="mt-6 text-2xl tabular-nums">{formatPrice(product.price)}</p>

          <p className="mt-8 text-[15px] leading-relaxed text-foreground/80 max-w-md">
            {product.description}
          </p>

          {(product.material || product.dimensions) && (
            <dl className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 text-sm border-t border-border pt-6 max-w-md">
              {product.material && (
                <>
                  <dt className="text-muted-foreground">Material</dt>
                  <dd>{product.material}</dd>
                </>
              )}
              {product.dimensions && (
                <>
                  <dt className="text-muted-foreground">Dimensions</dt>
                  <dd>{product.dimensions}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Lead time</dt>
              <dd>5–7 days</dd>
            </dl>
          )}

          <div className="mt-10 flex items-stretch gap-3">
            <div className="inline-flex items-center border border-border-strong rounded-full overflow-hidden">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-12 w-12 inline-flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="h-12 w-12 inline-flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background h-12 px-6 text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              {added ? (
                <><Check className="h-4 w-4" /> Added to bag</>
              ) : (
                <><ShoppingBag className="h-4 w-4" /> Add to bag · {formatPrice(product.price * qty)}</>
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Free shipping on orders over $150 · 30-day returns
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border mt-8 md:mt-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-20">
            <h2 className="font-display text-3xl md:text-4xl mb-8 md:mb-10">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
