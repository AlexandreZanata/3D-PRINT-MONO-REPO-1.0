import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Forma" },
      { name: "description", content: "Complete your order." },
      { property: "og:title", content: "Checkout — Forma" },
      { property: "og:description", content: "Complete your order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { detailed, subtotal, count, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  if (count === 0 && !done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl mb-3">Nothing to check out</h1>
        <Link to="/shop" className="underline underline-offset-4">Browse the collection</Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setDone(true);
    clear();
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 md:py-28 text-center animate-fade-up">
        <div className="mx-auto h-14 w-14 rounded-full bg-foreground text-background inline-flex items-center justify-center mb-6">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="font-display text-5xl mb-3">Order placed</h1>
        <p className="text-muted-foreground mb-8">
          A confirmation is on its way. We'll begin printing within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="inline-flex rounded-full bg-foreground text-background px-6 py-3 text-sm hover:opacity-90 transition-opacity"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-16">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to bag
      </Link>
      <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-10">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-7 space-y-10">
          <Section title="Contact">
            <Field label="Email" type="email" name="email" required placeholder="you@email.com" />
          </Section>

          <Section title="Shipping address">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" name="first" required />
              <Field label="Last name" name="last" required />
            </div>
            <Field label="Address" name="address" required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" name="city" required />
              <Field label="Postal code" name="postal" required />
            </div>
            <Field label="Country" name="country" defaultValue="United States" required />
          </Section>

          <Section title="Payment">
            <Field label="Card number" name="card" placeholder="1234 1234 1234 1234" required inputMode="numeric" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expiry" name="expiry" placeholder="MM / YY" required />
              <Field label="CVC" name="cvc" placeholder="123" required inputMode="numeric" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              This is a demo checkout — no payment will be processed.
            </p>
          </Section>
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-surface p-6 md:p-7">
            <h2 className="font-display text-2xl mb-5">Order</h2>
            <ul className="space-y-3 mb-5">
              {detailed.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-md overflow-hidden bg-background shrink-0">
                    <img
                      src={product.images[0]}
                      alt=""
                      width={112}
                      height={112}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full bg-foreground text-background flex items-center justify-center tabular-nums">
                      {quantity}
                    </span>
                  </div>
                  <p className="text-sm flex-1 truncate">{product.name}</p>
                  <p className="text-sm tabular-nums">
                    {formatPrice(product.price * quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base mt-2">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(total)}</dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-foreground text-background h-12 text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? "Placing order…" : `Pay ${formatPrice(total)}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-border-strong focus:outline-none text-sm transition-colors"
      />
    </label>
  );
}
