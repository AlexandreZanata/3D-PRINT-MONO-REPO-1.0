import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminFetchProducts,
  adminUpdateProduct,
} from "@/api/admin.api";
import type { CreateProductInput, UpdateProductInput } from "../types";
import type { Product } from "@/features/products/types";

export const ADMIN_PRODUCT_QUERY_KEYS = {
  list: (page: number, limit: number) => ["admin", "products", page, limit] as const,
} as const;

/**
 * Fetches all products (including inactive) for the admin panel.
 * Stale time: 0 — admin data is always fresh.
 */
export function useAdminProducts(page = 1, limit = 20): {
  data: { items: Product[]; total: number } | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ADMIN_PRODUCT_QUERY_KEYS.list(page, limit),
    queryFn: () => adminFetchProducts(page, limit),
    staleTime: 0,
  });
  return { data, isLoading };
}

/** Creates a product and invalidates the admin product list. */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => adminCreateProduct(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

/** Updates a product and invalidates the admin product list. */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      adminUpdateProduct(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

/** Soft-deletes a product and invalidates the admin product list. */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
