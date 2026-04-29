import type { ListProductsQueryDTO } from "@repo/contracts";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository, ProductFilters } from "@repo/domain";
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
  const filters: ProductFilters = {};
  const mutable = filters as {
    name?: string;
    slug?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    category?: string;
  };
  if (query.name !== undefined) mutable.name = query.name;
  if (query.slug !== undefined) mutable.slug = query.slug;
  if (query.minPrice !== undefined) mutable.minPrice = query.minPrice;
  if (query.maxPrice !== undefined) mutable.maxPrice = query.maxPrice;
  if (query.isActive !== undefined) mutable.isActive = query.isActive;
  if (query.category !== undefined) mutable.category = query.category;
  return filters;
}

export class ListProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(query: ListProductsQueryDTO): Promise<Result<ListProductsResult, Error>> {
    const result = await this.productRepo.findAll(buildFilters(query), {
      page: query.page,
      limit: query.limit,
    });

    if (!result.ok) return err(result.error);

    return ok({
      items: result.value.items.map(toProductDTO),
      total: result.value.total,
      page: result.value.page,
      limit: result.value.limit,
    });
  }
}
