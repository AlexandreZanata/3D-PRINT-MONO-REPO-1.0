// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository } from "@repo/domain";
import { NotFoundError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";

export interface WhatsAppLinkResult {
  readonly url: string;
}

/**
 * Builds a wa.me deep-link for a product.
 * Format: https://wa.me/{number}?text={encoded message}
 */
export class GetWhatsAppLinkUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(productId: string): Promise<Result<WhatsAppLinkResult, Error>> {
    const found = await this.productRepo.findById(productId);
    if (!found.ok) return err(found.error);
    if (found.value === null) {
      return err(new NotFoundError(`Product ${productId} not found`, "PRODUCT_NOT_FOUND"));
    }

    const product = found.value;
    const text = encodeURIComponent(
      `Hi! I'm interested in "${product.name}" (R$ ${product.price.toString()})`,
    );
    const url = `https://wa.me/${product.whatsappNumber.value}?text=${text}`;

    return ok({ url });
  }
}
