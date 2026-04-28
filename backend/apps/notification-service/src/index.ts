// @max-lines 200 — this is enforced by the lint pipeline.
import { createLogger } from "@repo/utils";
import { buildCompositionRoot } from "./composition-root.js";
import { buildServer } from "./server.js";

const logger = createLogger("notification-service");
const PORT = Number(process.env.NOTIFICATION_SERVICE_PORT ?? 3003);

async function main(): Promise<void> {
  const root = await buildCompositionRoot();
  const app = buildServer();

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "notification-service started");
  });

  const shutdown = async (): Promise<void> => {
    logger.info("Shutting down notification-service...");
    server.close(async () => {
      await root.close();
      logger.info("notification-service stopped");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((e) => {
  logger.fatal({ error: e }, "notification-service failed to start");
  process.exit(1);
});
