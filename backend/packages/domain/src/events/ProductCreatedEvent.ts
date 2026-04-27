// @max-lines 200 — this is enforced by the lint pipeline.
import type { DomainEvent } from "./DomainEvent.js";

export interface ProductCreatedEvent extends DomainEvent {
  readonly eventType: "product.created";
  readonly payload: {
    readonly productId: string;
    readonly name: string;
    readonly price: number;
    readonly whatsappNumber: string;
  };
}
