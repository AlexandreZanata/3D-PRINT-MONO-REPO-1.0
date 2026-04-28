// @max-lines 200 — this is enforced by the lint pipeline.
import type { RedisClient } from "@repo/domain";
import type { AppLogger } from "@repo/utils";

const LINK_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export interface ProductEventPayload {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
}

/**
 * Builds a WhatsApp deep-link from product event data and caches it in Redis.
 * Key: whatsapp:link:{productId}  TTL: 24h
 */
export class WhatsAppLinkService {
  constructor(
    private readonly redis: RedisClient,
    private readonly logger: AppLogger,
  ) {}

  async buildAndCache(whatsappNumber: string, product: ProductEventPayload): Promise<string> {
    const text = encodeURIComponent(
      `Hi! I'm interested in "${product.name}" (R$ ${product.price.toFixed(2)})`,
    );
    const url = `https://wa.me/${whatsappNumber}?text=${text}`;
    const key = `whatsapp:link:${product.productId}`;

    const result = await this.redis.set(key, url, LINK_TTL_SECONDS);
    if (!result.ok) {
      this.logger.warn(
        { productId: product.productId, error: result.error.message },
        "Failed to cache WhatsApp link",
      );
    }

    return url;
  }

  async getCached(productId: string): Promise<string | null> {
    const key = `whatsapp:link:${productId}`;
    const result = await this.redis.get(key);
    if (!result.ok) return null;
    return result.value;
  }
}
