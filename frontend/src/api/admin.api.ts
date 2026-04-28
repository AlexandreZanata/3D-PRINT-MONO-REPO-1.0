import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import type { AuditLog, AuditLogList, CreateProductInput, UpdateProductInput } from "@/features/admin/types";
import type { Product } from "@/features/products/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: { page: number; limit: number; total: number };
}

/**
 * Lists all products including inactive ones (admin view).
 */
export async function adminFetchProducts(page = 1, limit = 20): Promise<{ items: Product[]; total: number }> {
  const { data } = await httpClient.get<ApiEnvelope<Product[]>>(ENDPOINTS.ADMIN_PRODUCTS_LIST, {
    params: { page, limit },
  });
  return { items: data.data, total: data.meta?.total ?? 0 };
}

/**
 * Creates a new product. Returns the created product.
 */
export async function adminCreateProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await httpClient.post<ApiEnvelope<Product>>(
    ENDPOINTS.ADMIN_PRODUCT_CREATE,
    input,
  );
  return data.data;
}

/**
 * Updates an existing product. Returns the updated product.
 */
export async function adminUpdateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data } = await httpClient.put<ApiEnvelope<Product>>(
    ENDPOINTS.ADMIN_PRODUCT_UPDATE(id),
    input,
  );
  return data.data;
}

/**
 * Soft-deletes a product.
 */
export async function adminDeleteProduct(id: string): Promise<void> {
  await httpClient.delete(ENDPOINTS.ADMIN_PRODUCT_DELETE(id));
}

/**
 * Fetches paginated audit logs.
 */
export async function adminFetchAuditLogs(page = 1, limit = 20): Promise<AuditLogList> {
  const { data } = await httpClient.get<ApiEnvelope<AuditLog[]>>(ENDPOINTS.ADMIN_AUDIT_LOGS, {
    params: { page, limit },
  });
  return {
    items: data.data,
    page: data.meta?.page ?? page,
    limit: data.meta?.limit ?? limit,
    total: data.meta?.total ?? 0,
  };
}
