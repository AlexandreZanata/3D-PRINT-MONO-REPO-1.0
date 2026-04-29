import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import { toProduct, toProductList, toWhatsappUrl } from "@/facades/ProductFacade";
import type { ApiProduct, ApiWhatsappResponse } from "@/facades/ProductFacade";
import type { Product, ProductList, ProductFilters, WhatsappLink } from "@/features/products/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: { page: number; limit: number; total: number };
}

/**
 * Fetches the paginated public product list.
 * Calls ProductFacade.toProductList before returning — hooks receive domain types only.
 */
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductList> {
  const { data } = await httpClient.get<ApiEnvelope<ApiProduct[]>>(ENDPOINTS.PRODUCTS_LIST, {
    params: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      ...(filters.name !== undefined && { name: filters.name }),
      ...(filters.slug !== undefined && { slug: filters.slug }),
      ...(filters.category !== undefined && { category: filters.category }),
      ...(filters.minPrice !== undefined && { min_price: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { max_price: filters.maxPrice }),
      ...(filters.isActive !== undefined && { is_active: filters.isActive }),
    },
  });
  return toProductList({
    items: data.data,
    page: data.meta?.page ?? 1,
    limit: data.meta?.limit ?? 20,
    total: data.meta?.total ?? 0,
  });
}

/**
 * Fetches a single product by ID.
 * Calls ProductFacade.toProduct before returning.
 */
export async function fetchProductById(id: string): Promise<Product> {
  const { data } = await httpClient.get<ApiEnvelope<ApiProduct>>(ENDPOINTS.PRODUCT_BY_ID(id));
  return toProduct(data.data);
}

/**
 * Fetches a single product by slug.
 * Uses the list endpoint with a slug filter and returns the first match.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data } = await httpClient.get<ApiEnvelope<ApiProduct[]>>(ENDPOINTS.PRODUCTS_LIST, {
    params: { slug, limit: 1, page: 1 },
  });
  const first = data.data[0];
  return first ? toProduct(first) : null;
}

/**
 * Fetches the WhatsApp deep-link URL for a product.
 * Always delegates to the backend — never constructs the URL client-side.
 */
export async function fetchWhatsappLink(id: string): Promise<WhatsappLink> {
  const { data } = await httpClient.get<ApiEnvelope<ApiWhatsappResponse>>(
    ENDPOINTS.PRODUCT_WHATSAPP(id),
  );
  return { url: toWhatsappUrl(data.data) };
}
