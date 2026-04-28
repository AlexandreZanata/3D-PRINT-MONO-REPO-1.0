import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Forma" },
      { name: "description", content: "Review the items in your bag." },
      { property: "og:title", content: "Your bag — Forma" },
      { property: "og:description", content: "Review the items in your bag." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, setQuantity, remove, count } = useCart();
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 md:px-8 py-20 md:py-28 text-center animate-fade-up">
        <h1 className="font-display text-5xl mb-3">Your bag is empty</h1>
        <p className="text-muted-foreground mb-8">
          Quiet objects, made to order. Start with something small.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm hover:opacity-90 transition-opacity"
        >
          Browse the collection <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-8 md:mb-12">Your bag</h1>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <ul className="lg:col-span-8 divide-y divide-border">
          {detailed.map(({ product, quantity }) => (
            <li key={product.id} className="py-6 first:pt-0 flex gap-4 md:gap-6 animate-fade-in">
              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                className="shrink-0 w-24 h-28 md:w-32 md:h-40 rounded-lg overflow-hidden bg-surface"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  width={256}
                  height={320}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="font-display text-xl md:text-2xl hover:opacity-70 transition-opacity"
                    >
                      {product.name}
                    </Link>
                    <p className="tabular-nums text-sm md:text-base shrink-0">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{product.material}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="inline-flex items-center border border-border rounded-full">
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-secondary rounded-l-full"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-secondary rounded-r-full"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-surface p-6 md:p-7">
            <h2 className="font-display text-2xl mb-5">Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-base">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background h-12 text-sm hover:opacity-90 transition-opacity"
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              Taxes calculated at checkout
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
