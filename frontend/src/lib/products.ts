import vase from "@/assets/product-vase.jpg";
import lamp from "@/assets/product-lamp.jpg";
import bowl from "@/assets/product-bowl.jpg";
import chess from "@/assets/product-chess.jpg";
import planter from "@/assets/product-planter.jpg";
import clock from "@/assets/product-clock.jpg";
import bookend from "@/assets/product-bookend.jpg";
import jewelry from "@/assets/product-jewelry.jpg";

export type Category = "Decor" | "Lighting" | "Tableware" | "Games" | "Office";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: Category;
  material: string;
  dimensions: string;
  images: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "facet-vase",
    name: "Facet Vase",
    tagline: "Low-poly silhouette, hand-finished",
    description:
      "A sculpted vessel printed in biodegradable PLA and finished by hand. Its faceted geometry catches light differently throughout the day, becoming a quiet centerpiece for any room.",
    price: 68,
    category: "Decor",
    material: "Matte PLA — Cream",
    dimensions: "18 × 14 × 14 cm",
    images: [vase, bowl, planter],
  },
  {
    id: "2",
    slug: "curve-desk-lamp",
    name: "Curve Desk Lamp",
    tagline: "Organic form, warm directional glow",
    description:
      "A flowing parametric form in matte black, engineered for a steady warm light. Touch dimming, USB-C powered, and weighted for stability.",
    price: 184,
    category: "Lighting",
    material: "Matte ABS — Carbon Black",
    dimensions: "38 × 16 × 14 cm",
    images: [lamp, bookend, clock],
  },
  {
    id: "3",
    slug: "lattice-bowl",
    name: "Lattice Bowl",
    tagline: "Generative weave, fruit-ready",
    description:
      "An algorithmically generated lattice that holds fruit, keys, or quiet attention. Each piece is unique — the algorithm never prints the same pattern twice.",
    price: 52,
    category: "Tableware",
    material: "Food-safe PLA — Sand",
    dimensions: "10 × 22 × 22 cm",
    images: [bowl, vase, jewelry],
  },
  {
    id: "4",
    slug: "studio-chess-set",
    name: "Studio Chess Set",
    tagline: "Modern silhouettes, tournament weight",
    description:
      "A complete 32-piece set in matte white and ink. Weighted bases, precise tolerances, and a folding board printed in warm neutrals.",
    price: 142,
    category: "Games",
    material: "Resin — Matte",
    dimensions: "Board 36 × 36 cm",
    images: [chess, bookend, vase],
  },
  {
    id: "5",
    slug: "geo-planter",
    name: "Geo Planter",
    tagline: "Faceted terracotta, drainage included",
    description:
      "Inspired by mineral formations, printed in a warm terracotta-finish PLA. Includes a removable drainage tray.",
    price: 38,
    category: "Decor",
    material: "PLA — Terracotta",
    dimensions: "14 × 16 × 16 cm",
    images: [planter, vase, bowl],
  },
  {
    id: "6",
    slug: "minute-wall-clock",
    name: "Minute Wall Clock",
    tagline: "Brushed face, silent movement",
    description:
      "A minimal wall clock with a brushed graphite finish and silent sweeping movement. Mounts flush to the wall with a single screw.",
    price: 96,
    category: "Decor",
    material: "Composite — Graphite",
    dimensions: "Ø 30 cm",
    images: [clock, bookend, lamp],
  },
  {
    id: "7",
    slug: "duet-bookends",
    name: "Duet Bookends",
    tagline: "A pair, in conversation",
    description:
      "Two sculptural counterweights — one cream, one ink — designed to hold a row of books or simply stand on their own.",
    price: 78,
    category: "Office",
    material: "Resin — Matte",
    dimensions: "20 × 14 × 12 cm (each)",
    images: [bookend, vase, lamp],
  },
  {
    id: "8",
    slug: "honeycomb-jewelry-stand",
    name: "Honeycomb Jewelry Stand",
    tagline: "Open lattice, soft shadow",
    description:
      "A delicate hexagonal cage that holds earrings, rings, and small treasures while casting a beautiful patterned shadow.",
    price: 44,
    category: "Office",
    material: "PLA — Bone White",
    dimensions: "16 × 14 × 14 cm",
    images: [jewelry, bowl, vase],
  },
];

export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Decor",
  "Lighting",
  "Tableware",
  "Games",
  "Office",
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents);
}
