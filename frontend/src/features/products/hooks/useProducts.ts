import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/api/products.api";
import type { ProductFilters, ProductList } from "../types";

/** Query key constants — used by useSSE to update the cache directly. */
export const PRODUCT_QUERY_KEYS = {
  list: (filters: ProductFilters) => ["products", "list", filters] as const,
  detail: (id: string) => ["products", "detail", id] as const,
  whatsapp: (id: string) => ["products", "whatsapp", id] as const,
} as const;

/**
 * Fetches the paginated public product list.
 * Stale time: 60 seconds — products change infrequently; SSE handles real-time updates.
 */
export function useProducts(filters: ProductFilters = {}): {
  data: ProductList | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 60 * 1000,
  });
  return { data, isLoading, isError };
}
