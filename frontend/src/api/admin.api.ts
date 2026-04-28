import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import { toProduct } from "@/facades/ProductFacade";
import { toAuditLogList } from "@/facades/AdminFacade";
import type { ApiProduct } from "@/facades/ProductFacade";
import type { ApiAuditLog } from "@/facades/AdminFacade";
import type { AuditLogList, CreateProductInput, UpdateProductInput } from "@/features/admin/types";
import type { Product } from "@/features/products/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: { page: number; limit: number; total: number };
}

/** Lists all products including inactive ones (admin view). */
export async function adminFetchProducts(
  page = 1,
  limit = 20,
): Promise<{ items: Product[]; total: number }> {
  const { data } = await httpClient.get<ApiEnvelope<ApiProduct[]>>(
    ENDPOINTS.ADMIN_PRODUCTS_LIST,
    { params: { page, limit } },
  );
  return { items: data.data.map(toProduct), total: data.meta?.total ?? 0 };
}

/** Creates a new product. Returns the mapped Product. */
export async function adminCreateProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await httpClient.post<ApiEnvelope<ApiProduct>>(
    ENDPOINTS.ADMIN_PRODUCT_CREATE,
    input,
  );
  return toProduct(data.data);
}

/** Updates an existing product. Returns the mapped Product. */
export async function adminUpdateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const { data } = await httpClient.put<ApiEnvelope<ApiProduct>>(
    ENDPOINTS.ADMIN_PRODUCT_UPDATE(id),
    input,
  );
  return toProduct(data.data);
}

/** Soft-deletes a product. */
export async function adminDeleteProduct(id: string): Promise<void> {
  await httpClient.delete(ENDPOINTS.ADMIN_PRODUCT_DELETE(id));
}

/** Fetches paginated audit logs. */
export async function adminFetchAuditLogs(page = 1, limit = 20): Promise<AuditLogList> {
  const { data } = await httpClient.get<ApiEnvelope<ApiAuditLog[]>>(ENDPOINTS.ADMIN_AUDIT_LOGS, {
    params: { page, limit },
  });
  return toAuditLogList(data.data, {
    page: data.meta?.page ?? page,
    limit: data.meta?.limit ?? limit,
    total: data.meta?.total ?? 0,
  });
}
