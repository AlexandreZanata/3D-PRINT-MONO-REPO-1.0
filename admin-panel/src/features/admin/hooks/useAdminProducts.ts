import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminFetchProductById,
  adminFetchProducts,
  adminUpdateProduct,
} from "@/api/products.api";
import type { CreateProductInput, UpdateProductInput } from "../types";
import type { Product } from "@/features/products/types";

export const ADMIN_PRODUCT_QUERY_KEYS = {
  list: (page: number, limit: number) => ["admin", "products", page, limit] as const,
} as const;

export function useAdminProducts(page = 1, limit = 50): {
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

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ["admin", "product", id] as const,
    queryFn: () => adminFetchProductById(id),
    staleTime: 0,
    enabled: id.length > 0,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => adminCreateProduct(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

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

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
