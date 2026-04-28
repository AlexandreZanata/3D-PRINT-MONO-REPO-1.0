// @max-lines 200 — this is enforced by the lint pipeline.
import { createLogger } from "@repo/utils";
import { buildCompositionRoot } from "./composition-root.js";
import { buildServer } from "./server.js";

const logger = createLogger("admin-service");
const PORT = Number(process.env.ADMIN_SERVICE_PORT ?? 3002);

async function main(): Promise<void> {
  const root = await buildCompositionRoot();
  const app = buildServer(root);

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "admin-service started");
  });

  const shutdown = async (): Promise<void> => {
    logger.info("Shutting down admin-service...");
    server.close(async () => {
      await root.close();
      logger.info("admin-service stopped");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((e) => {
  logger.fatal({ error: e }, "admin-service failed to start");
  process.exit(1);
});
