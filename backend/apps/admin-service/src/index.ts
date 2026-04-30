// @max-lines 200 — this is enforced by the lint pipeline.
import "./load-env.js";
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

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.fatal({ port: PORT }, "admin-service listen failed: port already in use");
      console.error(
        `admin-service: port ${String(PORT)} is already in use.
Stop the other process (e.g. docker admin-service, or an old dev server) or set ADMIN_SERVICE_PORT.
Check: ss -tlnp | grep ':${String(PORT)}'  or  fuser ${String(PORT)}/tcp
`,
      );
      process.exit(1);
      return;
    }
    throw err;
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

main().catch((e: unknown) => {
  const detail =
    e instanceof Error ? { message: e.message, stack: e.stack } : { message: String(e) };
  logger.fatal({ err: detail }, "admin-service failed to start");
  console.error("admin-service failed to start:", e);
  process.exit(1);
});
