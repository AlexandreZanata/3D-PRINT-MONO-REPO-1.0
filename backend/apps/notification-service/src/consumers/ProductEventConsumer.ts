// @max-lines 200 — this is enforced by the lint pipeline.
import type { QueueMessage } from "@repo/domain";
import { InfraError } from "@repo/utils";
import type { Result } from "@repo/utils";
import { ok } from "@repo/utils";
import type { AppLogger } from "@repo/utils";
import type { WhatsAppLinkService } from "../services/WhatsAppLinkService.js";

interface ProductPayload extends Record<string, unknown> {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly whatsappNumber?: string;
}

function isProductPayload(v: Record<string, unknown>): v is ProductPayload {
  return (
    typeof v.productId === "string" && typeof v.name === "string" && typeof v.price === "number"
  );
}

/**
 * Handles product.created and product.updated events.
 * Builds and caches a WhatsApp deep-link for the product.
 * Returns Result<void, InfraError> to satisfy MessageHandler contract.
 */
export class ProductEventConsumer {
  constructor(
    private readonly whatsAppService: WhatsAppLinkService,
    private readonly logger: AppLogger,
  ) {}

  handleCreated = async (msg: QueueMessage): Promise<Result<void, InfraError>> => {
    return this.handleProductEvent(msg, "product.created");
  };

  handleUpdated = async (msg: QueueMessage): Promise<Result<void, InfraError>> => {
    return this.handleProductEvent(msg, "product.updated");
  };

  handleDeleted = async (msg: QueueMessage): Promise<Result<void, InfraError>> => {
    const productId = msg.payload.productId;
    if (typeof productId === "string") {
      this.logger.info(
        { productId, eventType: "product.deleted" },
        "Product deleted event received",
      );
    }
    return ok(undefined);
  };

  private async handleProductEvent(
    msg: QueueMessage,
    eventType: string,
  ): Promise<Result<void, InfraError>> {
    if (!isProductPayload(msg.payload)) {
      this.logger.warn(
        { eventId: msg.eventId, eventType },
        "Invalid product event payload — skipping",
      );
      return ok(undefined); // Ack malformed messages to avoid DLQ spam
    }

    const payload = msg.payload;
    const whatsappNumber =
      typeof payload.whatsappNumber === "string"
        ? payload.whatsappNumber
        : (process.env.DEFAULT_WHATSAPP_NUMBER ?? "");

    if (!whatsappNumber) {
      this.logger.warn(
        { productId: payload.productId },
        "No whatsapp number — skipping link build",
      );
      return ok(undefined);
    }

    try {
      const url = await this.whatsAppService.buildAndCache(whatsappNumber, payload);
      this.logger.info({ productId: payload.productId, eventType, url }, "WhatsApp link cached");
      return ok(undefined);
    } catch (e) {
      const cause = e instanceof Error ? e : new Error(String(e));
      return {
        ok: false,
        error: new InfraError("WhatsApp link build failed", cause, "NOTIFICATION_ERROR"),
      };
    }
  }
}
