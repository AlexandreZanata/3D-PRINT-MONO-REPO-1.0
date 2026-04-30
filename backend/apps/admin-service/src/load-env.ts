import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

/** Loads `backend/.env` when the file exists (local dev from `apps/admin-service`). */
const backendEnv = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  ".env",
);

if (existsSync(backendEnv)) {
  config({ path: backendEnv });
}
