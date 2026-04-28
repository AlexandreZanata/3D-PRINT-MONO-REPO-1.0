// @max-lines 200 — this is enforced by the lint pipeline.

export type SSEEventType = "product.created" | "product.updated" | "product.deleted";

export interface SSEEventPayload {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly eventId: string;
  readonly occurredAt: string; // ISO 8601
}

export interface SSEConnection {
  readonly id: string;
  readonly response: NodeJS.WritableStream;
  readonly connectedAt: Date;
}
