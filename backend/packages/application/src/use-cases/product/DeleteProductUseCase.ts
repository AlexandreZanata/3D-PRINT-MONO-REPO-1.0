// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository } from "@repo/domain";
import { NotFoundError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";

export class DeleteProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(id: string): Promise<Result<void, Error>> {
    const found = await this.productRepo.findById(id);
    if (!found.ok) return err(found.error);
    if (found.value === null) {
      return err(new NotFoundError(`Product ${id} not found`, "PRODUCT_NOT_FOUND"));
    }

    const result = await this.productRepo.softDelete(id);
    if (!result.ok) return err(result.error);

    return ok(undefined);
  }
}
