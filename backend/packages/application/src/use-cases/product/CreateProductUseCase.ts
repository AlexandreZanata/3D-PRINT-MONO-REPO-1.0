// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository } from "@repo/domain";
import { Product } from "@repo/domain";
import type { CreateProductDTO } from "@repo/contracts";
import { DomainError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { ProductDTO } from "../../dtos/ProductDTO.js";
import { toProductDTO } from "../../mappers/product.mapper.js";

export interface CreateProductDeps {
  readonly productRepo: IProductRepository;
  readonly generateId: () => string;
}

export class CreateProductUseCase {
  constructor(private readonly deps: CreateProductDeps) {}

  async execute(dto: CreateProductDTO): Promise<Result<ProductDTO, Error>> {
    let product: Product;

    try {
      product = Product.create({
        id: this.deps.generateId(),
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        whatsappNumber: dto.whatsappNumber,
        imageUrl: dto.imageUrl ?? null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid product data";
      return err(new DomainError(msg, "INVALID_PRODUCT"));
    }

    const result = await this.deps.productRepo.save(product);
    if (!result.ok) return err(result.error);

    return ok(toProductDTO(product));
  }
}
