/**
 * ProductCard molecule — usage examples (non-rendered documentation file).
 * This file is not imported anywhere — it exists for documentation only.
 */
import { ProductCard } from "./ProductCard";
import type { Product } from "@/features/products/types";

const sampleProduct: Product = {
  id: "1",
  slug: "facet-vase",
  name: "Facet Vase",
  tagline: "Low-poly silhouette, hand-finished",
  description: "A sculpted vessel printed in biodegradable PLA.",
  price: 68,
  category: "Decor",
  material: "Matte PLA — Cream",
  dimensions: "18 × 14 × 14 cm",
  images: ["/placeholder.jpg"],
  stock: 10,
  whatsappNumber: "+5511999999999",
  imageUrl: null,
  isActive: true,
  createdAt: "2026-04-28T00:00:00.000Z",
  updatedAt: "2026-04-28T00:00:00.000Z",
  deletedAt: null,
};

export const Default = () => <ProductCard product={sampleProduct} />;
