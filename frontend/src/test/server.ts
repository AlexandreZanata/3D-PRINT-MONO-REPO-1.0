import { setupServer } from "msw/node";
import { productHandlers } from "./handlers/products.handlers";
import { authHandlers } from "./handlers/auth.handlers";
import { adminHandlers } from "./handlers/admin.handlers";

/**
 * MSW server instance — used in all component and hook tests.
 * Handlers mirror the backend API contract from backend/docs/api.md.
 */
export const server = setupServer(
  ...productHandlers,
  ...authHandlers,
  ...adminHandlers,
);
