import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";
import heroImage from "@/assets/hero-sculpture.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forma — 3D printed objects for everyday rituals" },
      {
        name: "description",
        content:
          "Sculptural 3D printed vases, lighting, and tableware. Made to order in small batches.",
      },
      { property: "og:title", content: "Forma — 3D printed objects for everyday rituals" },
      {
        property: "og:description",
        content: "Sculptural 3D printed vases, lighting, and tableware. Made to order.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = PRODUCTS.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-6 lg:col-span-5 animate-fade-up">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
                Studio · 2026 collection
              </p>
              <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-tight">
                Objects, <em className="italic text-muted-foreground">printed</em>
                <br />
                in quiet detail.
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                Sculptural homeware, additively manufactured in our studio. Made to order, finished
                by hand, shipped in recyclable packaging.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm hover:opacity-90 transition-opacity"
                >
                  Shop the collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/shop"
                  search={{ category: "Lighting" }}
                  className="inline-flex items-center rounded-full px-5 py-3 text-sm border border-border-strong hover:bg-secondary transition-colors"
                >
                  Lighting
                </Link>
              </div>
            </div>

            <div className="md:col-span-6 lg:col-span-7 animate-scale-in">
              <div className="aspect-[5/4] md:aspect-[6/5] rounded-2xl overflow-hidden bg-surface">
                <img
                  src={heroImage}
                  alt="Sculptural 3D printed form in cream"
                  width={1536}
                  height={1024}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Featured
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">
              Newly in the studio
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm hover:opacity-60 transition-opacity"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Story strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-3 gap-8 md:gap-16">
          {[
            {
              title: "Made to order",
              body: "Every piece is printed when you order it. No overstock, minimal waste, ships in 5–7 days.",
            },
            {
              title: "Hand finished",
              body: "Sanded, sealed, and inspected in our studio before each piece leaves us.",
            },
            {
              title: "Plant-based PLA",
              body: "We print primarily in compostable, plant-derived PLA. Recyclable packaging, always.",
            },
          ].map((card) => (
            <div key={card.title}>
              <h3 className="font-display text-2xl mb-3">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Forma Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <a href="#" className="hover:text-foreground transition-colors">Journal</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
