// @max-lines 200 — this is enforced by the lint pipeline.
// poc.ts — minimum working usage of @repo/sse-adapter
// Run: npx tsx poc.ts
// Then in another terminal: curl http://localhost:3100/events

import { createLogger } from "@repo/utils";
import { createServer } from "node:http";
import { SSEManager } from "./src/index.js";

const logger = createLogger("sse-poc");
const manager = new SSEManager(
  {
    maxConnections: 500,
    heartbeatIntervalMs: 30000, // 30 seconds
  },
  logger,
);

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = createServer((req, res) => {
  if (req.url === "/events" && req.method === "GET") {
    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const connectionId = crypto.randomUUID();
    const added = manager.addConnection(connectionId, res);

    if (!added) {
      res.writeHead(503);
      res.end("Max connections reached");
      return;
    }

    logger.info({ connectionId }, "Client connected to SSE");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3100, () => {
  logger.info("SSE server listening on http://localhost:3100/events");
});

// ── Simulate events every 5 seconds ──────────────────────────────────────────
setInterval(() => {
  manager.broadcast("product.created", {
    productId: `prod-${Date.now()}`,
    name: "Geometric Vase",
    price: 49.99,
    eventId: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
  });
  logger.info({ connections: manager.connectionCount() }, "Broadcasted product.created event");
}, 5000);

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on("SIGINT", () => {
  logger.info("Shutting down...");
  manager.close();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});
