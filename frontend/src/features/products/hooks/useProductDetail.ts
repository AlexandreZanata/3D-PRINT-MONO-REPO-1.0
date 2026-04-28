import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/api/products.api";
import type { Product } from "../types";
import { PRODUCT_QUERY_KEYS } from "./useProducts";

/**
 * Fetches a single product by ID.
 * Stale time: 300 seconds — detail pages change rarely.
 */
export function useProductDetail(id: string): {
  data: Product | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: () => fetchProductById(id),
    staleTime: 300 * 1000,
    enabled: id.length > 0,
  });
  return { data, isLoading, isError };
}
