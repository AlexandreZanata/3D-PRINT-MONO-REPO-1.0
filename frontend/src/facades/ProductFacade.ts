import type { Product, ProductList, WhatsappLink } from "@/features/products/types";

/**
 * Raw API shapes — exactly what the backend returns before mapping.
 * These types must match the OpenAPI spec in backend/docs/api.md.
 */
export interface ApiProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number | string; // backend returns numeric string from Drizzle
  readonly stock: number | string;
  readonly whatsappNumber: string;
  readonly imageUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

export interface ApiProductList {
  readonly items: ApiProduct[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export interface ApiWhatsappResponse {
  readonly url: string;
}

/**
 * Maps a raw API product to the frontend Product domain type.
 * Normalizes price and stock to numbers (Drizzle returns numeric strings).
 */
export function toProduct(raw: ApiProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: typeof raw.price === "string" ? parseFloat(raw.price) : raw.price,
    stock: typeof raw.stock === "string" ? parseInt(raw.stock, 10) : raw.stock,
    whatsappNumber: raw.whatsappNumber,
    imageUrl: raw.imageUrl,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    deletedAt: raw.deletedAt,
  };
}

/**
 * Maps a raw API product list to the frontend ProductList domain type.
 */
export function toProductList(raw: ApiProductList): ProductList {
  return {
    items: raw.items.map(toProduct),
    page: raw.page,
    limit: raw.limit,
    total: raw.total,
  };
}

/**
 * Extracts the WhatsApp URL from the API response.
 */
export function toWhatsappUrl(raw: ApiWhatsappResponse): string {
  return raw.url;
}
