import { randomUUID } from "node:crypto";
import type {
  ListProductsResult,
  ProductDTO,
  ProductFacade,
  WhatsAppLinkResult,
} from "@repo/application";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { CreateProductDTO, ListProductsQueryDTO, UpdateProductDTO } from "@repo/contracts";
import type { QueuePublisher } from "@repo/domain";
import type { SSEEventPayload, SSEEventType, SSEManager } from "@repo/sse-adapter";
import type { AppLogger, Result } from "@repo/utils";

type RoutingKeys = {
  readonly PRODUCT_CREATED: string;
  readonly PRODUCT_UPDATED: string;
  readonly PRODUCT_DELETED: string;
};

interface ProductEventData {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
}

/**
 * Wraps ProductFacade to publish RabbitMQ messages and broadcast SSE events
 * after each mutating operation. Read operations are delegated unchanged.
 */
export class EventingProductFacade {
  constructor(
    private readonly inner: ProductFacade,
    private readonly publisher: QueuePublisher,
    private readonly sseManager: SSEManager,
    private readonly routingKeys: RoutingKeys,
    private readonly logger: AppLogger,
  ) {}

  list(query: ListProductsQueryDTO): Promise<Result<ListProductsResult, Error>> {
    return this.inner.list(query);
  }

  getById(id: string): Promise<Result<ProductDTO, Error>> {
    return this.inner.getById(id);
  }

  whatsAppLink(productId: string): Promise<Result<WhatsAppLinkResult, Error>> {
    return this.inner.whatsAppLink(productId);
  }

  async create(dto: CreateProductDTO): Promise<Result<ProductDTO, Error>> {
    const result = await this.inner.create(dto);
    if (result.ok) {
      await this.emit("product.created", this.routingKeys.PRODUCT_CREATED, {
        productId: result.value.id,
        name: result.value.name,
        price: result.value.price,
      });
    }
    return result;
  }

  async update(id: string, dto: UpdateProductDTO): Promise<Result<ProductDTO, Error>> {
    const result = await this.inner.update(id, dto);
    if (result.ok) {
      await this.emit("product.updated", this.routingKeys.PRODUCT_UPDATED, {
        productId: result.value.id,
        name: result.value.name,
        price: result.value.price,
      });
    }
    return result;
  }

  async delete(id: string): Promise<Result<void, Error>> {
    // Fetch product data before deletion so we can include it in the event
    const found = await this.inner.getById(id);
    const result = await this.inner.delete(id);
    if (result.ok) {
      const name = found.ok ? found.value.name : "";
      const price = found.ok ? found.value.price : 0;
      await this.emit("product.deleted", this.routingKeys.PRODUCT_DELETED, {
        productId: id,
        name,
        price,
      });
    }
    return result;
  }

  private async emit(
    eventType: SSEEventType,
    routingKey: string,
    data: ProductEventData,
  ): Promise<void> {
    const eventId = randomUUID();
    const occurredAt = new Date().toISOString();

    const publishResult = await this.publisher.publish(routingKey, {
      eventId,
      eventType,
      occurredAt,
      payload: { productId: data.productId, name: data.name, price: data.price },
    });

    if (!publishResult.ok) {
      this.logger.warn(
        { eventType, error: publishResult.error.message },
        "Failed to publish event to queue",
      );
    }

    const ssePayload: SSEEventPayload = {
      productId: data.productId,
      name: data.name,
      price: data.price,
      eventId,
      occurredAt,
    };
    this.sseManager.broadcast(eventType, ssePayload);
  }
}
