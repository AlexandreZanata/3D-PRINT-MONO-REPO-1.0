// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository } from "@repo/domain";
import { NotFoundError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { ProductDTO } from "../../dtos/ProductDTO.js";
import { toProductDTO } from "../../mappers/product.mapper.js";

export class GetProductByIdUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(id: string): Promise<Result<ProductDTO, Error>> {
    const result = await this.productRepo.findById(id);
    if (!result.ok) return err(result.error);

    if (result.value === null) {
      return err(new NotFoundError(`Product ${id} not found`, "PRODUCT_NOT_FOUND"));
    }

    return ok(toProductDTO(result.value));
  }
}
