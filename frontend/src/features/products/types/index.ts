/**
 * Frontend domain types for the products feature.
 * These are the mapped types returned by ProductFacade — not raw API shapes.
 */

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly whatsappNumber: string;
  readonly imageUrl: string | null;
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
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly isActive?: boolean;
}

export interface WhatsappLink {
  readonly url: string;
}
