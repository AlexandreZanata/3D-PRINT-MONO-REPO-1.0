// @max-lines 200 — this is enforced by the lint pipeline.
import { createLogger } from "@repo/utils";
import { buildServer } from "./server.js";

const logger = createLogger("api-gateway");
const PORT = Number(process.env.API_GATEWAY_PORT ?? 3000);

async function main(): Promise<void> {
  const app = buildServer();

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "api-gateway started");
  });

  const shutdown = (): void => {
    logger.info("Shutting down api-gateway...");
    server.close(() => {
      logger.info("api-gateway stopped");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((e) => {
  logger.fatal({ error: e }, "api-gateway failed to start");
  process.exit(1);
});
