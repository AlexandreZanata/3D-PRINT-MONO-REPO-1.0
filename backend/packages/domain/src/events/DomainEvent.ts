// @max-lines 200 — this is enforced by the lint pipeline.

/** Marker interface for all domain events. */
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
}
