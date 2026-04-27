// @max-lines 200 — this is enforced by the lint pipeline.
import type { InfraError } from "../common/InfraError.js";
import type { Result } from "../common/Result.js";

/** Message envelope published to the queue. */
export interface QueueMessage {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: string; // ISO 8601
  readonly payload: Record<string, unknown>;
}

export interface QueuePublisher {
  publish(routingKey: string, message: QueueMessage): Promise<Result<void, InfraError>>;
}
