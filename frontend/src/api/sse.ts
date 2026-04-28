import { ENDPOINTS } from "./endpoints";

export type SSEEventType = "product.created" | "product.updated" | "product.deleted";

export interface SSEProductPayload {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly eventId: string;
  readonly occurredAt: string;
}

export type SSEHandler = (eventType: SSEEventType, payload: SSEProductPayload) => void;

/**
 * Opens an EventSource connection to the SSE endpoint.
 * Returns a cleanup function that closes the connection.
 * EventSource does not support custom headers — the endpoint is public by design.
 */
export function openSSEConnection(onEvent: SSEHandler): () => void {
  const url = import.meta.env.VITE_SSE_URL ?? `http://localhost:3000${ENDPOINTS.PRODUCTS_EVENTS}`;
  const source = new EventSource(url);

  const eventTypes: SSEEventType[] = ["product.created", "product.updated", "product.deleted"];

  for (const type of eventTypes) {
    source.addEventListener(type, (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data as string) as SSEProductPayload;
        onEvent(type, payload);
      } catch {
        // Malformed event — ignore silently
      }
    });
  }

  return () => source.close();
}
