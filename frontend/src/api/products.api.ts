import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import type { Product, ProductList, ProductFilters, WhatsappLink } from "@/features/products/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: { page: number; limit: number; total: number };
}

/**
 * Fetches the paginated public product list.
 * Returns a mapped ProductList — never the raw API shape.
 */
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductList> {
  const { data } = await httpClient.get<ApiEnvelope<Product[]>>(ENDPOINTS.PRODUCTS_LIST, {
    params: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      ...(filters.name !== undefined && { name: filters.name }),
      ...(filters.minPrice !== undefined && { min_price: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { max_price: filters.maxPrice }),
      ...(filters.isActive !== undefined && { is_active: filters.isActive }),
    },
  });
  return {
    items: data.data,
    page: data.meta?.page ?? 1,
    limit: data.meta?.limit ?? 20,
    total: data.meta?.total ?? 0,
  };
}

/**
 * Fetches a single product by ID.
 */
export async function fetchProductById(id: string): Promise<Product> {
  const { data } = await httpClient.get<ApiEnvelope<Product>>(ENDPOINTS.PRODUCT_BY_ID(id));
  return data.data;
}

/**
 * Fetches the WhatsApp deep-link URL for a product.
 * Always delegates to the backend — never constructs the URL client-side.
 */
export async function fetchWhatsappLink(id: string): Promise<WhatsappLink> {
  const { data } = await httpClient.get<ApiEnvelope<WhatsappLink>>(
    ENDPOINTS.PRODUCT_WHATSAPP(id),
  );
  return data.data;
}
