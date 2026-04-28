import { EventEmitter } from "node:events";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { AppLogger } from "@repo/utils";
import type { SSEConnection, SSEEventPayload, SSEEventType } from "./types.js";

export interface SSEManagerConfig {
  readonly maxConnections: number;
  readonly heartbeatIntervalMs: number;
}

/**
 * Manages Server-Sent Events connections.
 * Maintains a Map of active connections and broadcasts events to all clients.
 */
export class SSEManager extends EventEmitter {
  private readonly connections = new Map<string, SSEConnection>();
  private readonly heartbeatInterval: NodeJS.Timeout;

  constructor(
    private readonly config: SSEManagerConfig,
    private readonly logger: AppLogger,
  ) {
    super();
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, config.heartbeatIntervalMs);
  }

  /**
   * Adds a new SSE connection.
   * Returns false if max connections limit is reached.
   */
  addConnection(id: string, response: NodeJS.WritableStream): boolean {
    if (this.connections.size >= this.config.maxConnections) {
      this.logger.warn(
        { connectionId: id, maxConnections: this.config.maxConnections },
        "SSE connection rejected: max connections reached",
      );
      return false;
    }

    const connection: SSEConnection = {
      id,
      response,
      connectedAt: new Date(),
    };

    this.connections.set(id, connection);
    this.logger.info(
      { connectionId: id, totalConnections: this.connections.size },
      "SSE connection added",
    );

    // Set up disconnect handler
    response.on("close", () => {
      this.removeConnection(id);
    });

    // Send initial connection confirmation
    this.sendEvent(
      response,
      "connected",
      { connectionId: id, timestamp: new Date().toISOString() },
      id,
    );

    return true;
  }

  /**
   * Removes a connection by ID.
   */
  removeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (!connection) return;

    this.connections.delete(id);
    this.logger.info(
      { connectionId: id, totalConnections: this.connections.size },
      "SSE connection removed",
    );
  }

  /**
   * Broadcasts an event to all connected clients.
   */
  broadcast(eventType: SSEEventType, payload: SSEEventPayload): void {
    this.logger.debug(
      { eventType, eventId: payload.eventId, connections: this.connections.size },
      "Broadcasting SSE event",
    );

    for (const connection of this.connections.values()) {
      this.sendEvent(connection.response, eventType, payload, payload.eventId);
    }
  }

  /**
   * Returns the current number of active connections.
   */
  connectionCount(): number {
    return this.connections.size;
  }

  /**
   * Sends a heartbeat comment to all connections to keep them alive.
   */
  private sendHeartbeat(): void {
    for (const connection of this.connections.values()) {
      try {
        connection.response.write(": heartbeat\n\n");
      } catch (e) {
        this.logger.warn({ connectionId: connection.id, error: e }, "Heartbeat failed");
        this.removeConnection(connection.id);
      }
    }
  }

  /**
   * Sends a single SSE event to a response stream.
   */
  private sendEvent(
    response: NodeJS.WritableStream,
    eventType: string,
    data: unknown,
    id: string,
  ): void {
    try {
      response.write(`event: ${eventType}\n`);
      response.write(`data: ${JSON.stringify(data)}\n`);
      response.write(`id: ${id}\n`);
      response.write("retry: 3000\n");
      response.write("\n");
    } catch (e) {
      this.logger.warn({ eventType, id, error: e }, "Failed to send SSE event");
    }
  }

  /**
   * Closes all connections and stops the heartbeat.
   */
  close(): void {
    clearInterval(this.heartbeatInterval);
    for (const connection of this.connections.values()) {
      try {
        connection.response.end();
      } catch {
        // Ignore errors on close
      }
    }
    this.connections.clear();
    this.logger.info("SSEManager closed");
  }
}
