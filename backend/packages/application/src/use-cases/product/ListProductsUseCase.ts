// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository, ProductFilters } from "@repo/domain";
import type { ListProductsQueryDTO } from "@repo/contracts";
import { type Result, err, ok } from "@repo/utils";
import type { ProductDTO } from "../../dtos/ProductDTO.js";
import { toProductDTO } from "../../mappers/product.mapper.js";

export interface ListProductsResult {
  readonly items: ProductDTO[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

function buildFilters(query: ListProductsQueryDTO): ProductFilters {
  // Build filters object omitting undefined keys to satisfy exactOptionalPropertyTypes
  const filters: ProductFilters = {};
  const mutable = filters as {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
  };
  if (query.name !== undefined) mutable.name = query.name;
  if (query.minPrice !== undefined) mutable.minPrice = query.minPrice;
  if (query.maxPrice !== undefined) mutable.maxPrice = query.maxPrice;
  if (query.isActive !== undefined) mutable.isActive = query.isActive;
  return filters;
}

export class ListProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(query: ListProductsQueryDTO): Promise<Result<ListProductsResult, Error>> {
    const result = await this.productRepo.findAll(
      buildFilters(query),
      { page: query.page, limit: query.limit },
    );

    if (!result.ok) return err(result.error);

    return ok({
      items: result.value.items.map(toProductDTO),
      total: result.value.total,
      page: result.value.page,
      limit: result.value.limit,
    });
  }
}
