import type { Product } from "@/features/products/types";

export interface ApiProduct {
  readonly id: string;
  readonly name: string;
  readonly slug: string | null;
  readonly tagline: string;
  readonly category: string;
  readonly material: string;
  readonly dimensions: string;
  readonly description: string;
  readonly price: number | string;
  readonly stock: number | string;
  readonly whatsappNumber: string;
  readonly imageUrl: string | null;
  readonly images: readonly string[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

export function toProduct(raw: ApiProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    tagline: raw.tagline,
    category: raw.category,
    material: raw.material,
    dimensions: raw.dimensions,
    description: raw.description,
    price: typeof raw.price === "string" ? parseFloat(raw.price) : raw.price,
    stock: typeof raw.stock === "string" ? parseInt(raw.stock, 10) : raw.stock,
    whatsappNumber: raw.whatsappNumber,
    imageUrl: raw.imageUrl,
    images: raw.images ?? [],
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    deletedAt: raw.deletedAt,
  };
}
