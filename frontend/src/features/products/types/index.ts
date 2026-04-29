/**
 * Frontend domain types for the products feature.
 * These are the mapped types returned by ProductFacade — not raw API shapes.
 */

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly slug: string | null;
  readonly tagline: string;
  readonly category: string;
  readonly material: string;
  readonly dimensions: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly whatsappNumber: string;
  readonly imageUrl: string | null;
  readonly images: readonly string[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

export interface ProductList {
  readonly items: Product[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export interface ProductFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly name?: string;
  readonly slug?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly isActive?: boolean;
  readonly category?: string;
}

export interface WhatsappLink {
  readonly url: string;
}

/** Flat map of all site settings keyed by dot-notation key. */
export interface SiteSettings {
  readonly [key: string]: string;
}
