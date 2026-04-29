import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import { toProduct } from "@/facades/ProductFacade";
import type { ApiProduct } from "@/facades/ProductFacade";
import type { CreateProductInput, UpdateProductInput } from "@/features/admin/types";
import type { Product } from "@/features/products/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: { page: number; limit: number; total: number };
}

export async function adminFetchProducts(
  page = 1,
  limit = 50,
): Promise<{ items: Product[]; total: number }> {
  const { data } = await httpClient.get<ApiEnvelope<ApiProduct[]>>(ENDPOINTS.ADMIN_PRODUCTS_LIST, {
    params: { page, limit },
  });
  return { items: data.data.map(toProduct), total: data.meta?.total ?? 0 };
}

export async function adminFetchProductById(id: string): Promise<Product> {
  const { data } = await httpClient.get<ApiEnvelope<ApiProduct>>(ENDPOINTS.ADMIN_PRODUCT_BY_ID(id));
  return toProduct(data.data);
}

export async function adminCreateProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await httpClient.post<ApiEnvelope<ApiProduct>>(
    ENDPOINTS.ADMIN_PRODUCT_CREATE,
    input,
  );
  return toProduct(data.data);
}

export async function adminUpdateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data } = await httpClient.put<ApiEnvelope<ApiProduct>>(
    ENDPOINTS.ADMIN_PRODUCT_UPDATE(id),
    input,
  );
  return toProduct(data.data);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await httpClient.delete(ENDPOINTS.ADMIN_PRODUCT_DELETE(id));
}
