import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/molecules/ProductCard/ProductCard";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useSiteSettings, useSetting } from "@/features/products/hooks/useSiteSettings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forma — 3D printed objects for everyday rituals" },
      { name: "description", content: "Sculptural 3D printed vases, lighting, and tableware. Made to order in small batches." },
      { property: "og:title", content: "Forma — 3D printed objects for everyday rituals" },
      { property: "og:description", content: "Sculptural 3D printed vases, lighting, and tableware. Made to order." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: productList } = useProducts({ limit: 6, isActive: true });
  const { data: settings } = useSiteSettings();

  const badgeText    = useSetting(settings, "hero.badgeText",      "Studio · 2026 collection");
  const headline     = useSetting(settings, "hero.headline",       "Objects, printed\nin quiet detail.");
  const subheadline  = useSetting(settings, "hero.subheadline",    "Sculptural homeware, additively manufactured in our studio. Made to order, finished by hand, shipped in recyclable packaging.");
  const heroImageUrl = useSetting(settings, "hero.imageUrl",       "");
  const ctaLabel     = useSetting(settings, "hero.ctaLabel",       "Shop the collection");
  const ctaLink      = useSetting(settings, "hero.ctaLink",        "/shop");
  const secLabel     = useSetting(settings, "hero.secondaryLabel", "Lighting");
  const secLink      = useSetting(settings, "hero.secondaryLink",  "/shop?category=Lighting");
  const featBadge    = useSetting(settings, "featured.badge",      "Featured");
  const featTitle    = useSetting(settings, "featured.title",      "Newly in the studio");
  const card1Title   = useSetting(settings, "story.card1.title",   "Made to order");
  const card1Body    = useSetting(settings, "story.card1.body",    "Every piece is printed when you order it. No overstock, minimal waste, ships in 5–7 days.");
  const card2Title   = useSetting(settings, "story.card2.title",   "Hand finished");
  const card2Body    = useSetting(settings, "story.card2.body",    "Sanded, sealed, and inspected in our studio before each piece leaves us.");
  const card3Title   = useSetting(settings, "story.card3.title",   "Plant-based PLA");
  const card3Body    = useSetting(settings, "story.card3.body",    "We print primarily in compostable, plant-derived PLA. Recyclable packaging, always.");
  const copyright    = useSetting(settings, "footer.copyright",    "© 2026 Forma Studio. All rights reserved.");

  const featured = productList?.items ?? [];

  // Render headline with literal \n as line breaks
  const headlineParts = headline.split("\\n");

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-6 lg:col-span-5 animate-fade-up">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
                {badgeText}
              </p>
              <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-tight">
                {headlineParts.map((part, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {part}
                  </span>
                ))}
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                {subheadline}
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Link
                  to={ctaLink as "/shop"}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm hover:opacity-90 transition-opacity"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={secLink as "/shop"}
                  className="inline-flex items-center rounded-full px-5 py-3 text-sm border border-border-strong hover:bg-secondary transition-colors"
                >
                  {secLabel}
                </Link>
              </div>
            </div>

            <div className="md:col-span-6 lg:col-span-7 animate-scale-in">
              <div className="aspect-[5/4] md:aspect-[6/5] rounded-2xl overflow-hidden bg-surface">
                {heroImageUrl ? (
                  <img
                    src={heroImageUrl}
                    alt="Hero"
                    width={1536}
                    height={1024}
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent to-surface" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{featBadge}</p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{featTitle}</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1.5 text-sm hover:opacity-60 transition-opacity">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Story strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-3 gap-8 md:gap-16">
          {[
            { title: card1Title, body: card1Body },
            { title: card2Title, body: card2Body },
            { title: card3Title, body: card3Body },
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
          <p>{copyright}</p>
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
