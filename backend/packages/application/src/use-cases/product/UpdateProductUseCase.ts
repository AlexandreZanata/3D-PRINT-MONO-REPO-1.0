// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository } from "@repo/domain";
import { Product, PriceVO, WhatsAppNumberVO } from "@repo/domain";
import type { UpdateProductDTO } from "@repo/contracts";
import { DomainError, NotFoundError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { ProductDTO } from "../../dtos/ProductDTO.js";
import { toProductDTO } from "../../mappers/product.mapper.js";

export class UpdateProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(id: string, dto: UpdateProductDTO): Promise<Result<ProductDTO, Error>> {
    const found = await this.productRepo.findById(id);
    if (!found.ok) return err(found.error);
    if (found.value === null) {
      return err(new NotFoundError(`Product ${id} not found`, "PRODUCT_NOT_FOUND"));
    }

    const existing = found.value;
    let price = existing.price;
    let whatsappNumber = existing.whatsappNumber;

    try {
      if (dto.price !== undefined) price = PriceVO.create(dto.price);
      if (dto.whatsappNumber !== undefined) {
        whatsappNumber = WhatsAppNumberVO.create(dto.whatsappNumber);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid update data";
      return err(new DomainError(msg, "INVALID_PRODUCT"));
    }

    const updated = Product.reconstitute({
      id: existing.id,
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      price,
      stock: dto.stock ?? existing.stock,
      whatsappNumber,
      imageUrl: dto.imageUrl !== undefined ? (dto.imageUrl ?? null) : existing.imageUrl,
      isActive: dto.isActive ?? existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      deletedAt: existing.deletedAt,
    });

    const result = await this.productRepo.update(updated);
    if (!result.ok) return err(result.error);

    return ok(toProductDTO(updated));
  }
}
