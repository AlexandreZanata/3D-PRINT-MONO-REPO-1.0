import { useMemo } from "react";

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Computes pagination state from server-returned meta values.
 * Use with React Query's data.meta to drive PaginationBar.
 */
export function usePagination(opts: {
  page: number;
  limit: number;
  total: number;
}): PaginationState {
  return useMemo(() => {
    const totalPages = opts.total > 0 ? Math.ceil(opts.total / opts.limit) : 1;
    return {
      page: opts.page,
      limit: opts.limit,
      total: opts.total,
      totalPages,
      hasPrev: opts.page > 1,
      hasNext: opts.page < totalPages,
    };
  }, [opts.page, opts.limit, opts.total]);
}
