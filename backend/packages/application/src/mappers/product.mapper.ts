// @max-lines 200 — this is enforced by the lint pipeline.
import type { Product } from "@repo/domain";
import type { ProductDTO } from "../dtos/ProductDTO.js";

/** Maps a Product domain entity to a serialisable DTO. */
export function toProductDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price.value,
    stock: product.stock,
    whatsappNumber: product.whatsappNumber.toE164(),
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    deletedAt: product.deletedAt?.toISOString() ?? null,
  };
}
