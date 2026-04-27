// @max-lines 200 — this is enforced by the lint pipeline.
import type { DomainEvent } from "./DomainEvent.js";

export interface ProductDeletedEvent extends DomainEvent {
  readonly eventType: "product.deleted";
  readonly payload: {
    readonly productId: string;
  };
}
