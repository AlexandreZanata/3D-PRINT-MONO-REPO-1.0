// @max-lines 200 — this is enforced by the lint pipeline.
import type { InfraError } from "../common/index.js";
import type { Result } from "../common/Result.js";
import type { Product } from "../entities/Product.js";

export interface ProductFilters {
  readonly name?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly isActive?: boolean;
}

export interface PaginationOptions {
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Result<Product | null, InfraError>>;
  findAll(
    filters: ProductFilters,
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedResult<Product>, InfraError>>;
  save(product: Product): Promise<Result<void, InfraError>>;
  update(product: Product): Promise<Result<void, InfraError>>;
  softDelete(id: string): Promise<Result<void, InfraError>>;
}
