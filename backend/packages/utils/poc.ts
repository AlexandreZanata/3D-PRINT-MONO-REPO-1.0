// @max-lines 200 — this is enforced by the lint pipeline.
// poc.ts — minimum working usage of @repo/utils
// Run: npx tsx poc.ts

import { createLogger } from "./src/logger.js";
import { err, ok, type Result } from "./src/result.js";
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  InfraError,
  NotFoundError,
  UnauthorizedError,
} from "./src/errors/index.js";

const logger = createLogger("poc");

// ── Result type ──────────────────────────────────────────────────────────────
function findUser(id: string): Result<{ id: string; name: string }, NotFoundError> {
  if (id === "1") return ok({ id: "1", name: "Alice" });
  return err(new NotFoundError(`User ${id} not found`));
}

const found = findUser("1");
if (found.ok) logger.info({ user: found.value }, "user found");

const missing = findUser("99");
if (!missing.ok) logger.warn({ code: missing.error.code }, "user missing");

// ── Error hierarchy ───────────────────────────────────────────────────────────
const errors = [
  new DomainError("price must be positive"),
  new NotFoundError("product not found"),
  new UnauthorizedError("token expired"),
  new ForbiddenError("admin only"),
  new ConflictError("email taken"),
  new InfraError("db down", new Error("ECONNREFUSED")),
];

for (const e of errors) {
  logger.info({ code: e.code, status: e.httpStatus }, e.message);
}
