import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSSE } from "@/hooks/useSSE";
import type { SSEProductPayload, SSEEventType } from "@/api/sse";
import { PRODUCT_QUERY_KEYS } from "./useProducts";
import type { Product, ProductList } from "../types";

/**
 * Subscribes to the SSE product event stream and updates the React Query cache
 * directly — no full refetch needed.
 *
 * - product.created  → prepend to list cache
 * - product.updated  → update item in list + detail cache
 * - product.deleted  → remove from list cache
 */
export function useProductSSE(): void {
  const queryClient = useQueryClient();

  const handleEvent = useCallback(
    (eventType: SSEEventType, payload: SSEProductPayload) => {
      if (eventType === "product.created") {
        // Invalidate list so next render fetches fresh data with the new item
        void queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      }

      if (eventType === "product.updated") {
        // Update the detail cache if it exists
        queryClient.setQueryData<Product>(
          PRODUCT_QUERY_KEYS.detail(payload.productId),
          (old) => {
            if (!old) return old;
            return { ...old, name: payload.name, price: payload.price };
          },
        );
        // Update the item inside every list cache entry
        queryClient.setQueriesData<ProductList>(
          { queryKey: ["products", "list"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((p) =>
                p.id === payload.productId
                  ? { ...p, name: payload.name, price: payload.price }
                  : p,
              ),
            };
          },
        );
      }

      if (eventType === "product.deleted") {
        // Remove from all list caches
        queryClient.setQueriesData<ProductList>(
          { queryKey: ["products", "list"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.filter((p) => p.id !== payload.productId),
              total: Math.max(0, old.total - 1),
            };
          },
        );
        // Remove detail cache
        queryClient.removeQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(payload.productId) });
      }
    },
    [queryClient],
  );

  useSSE(handleEvent);
}
