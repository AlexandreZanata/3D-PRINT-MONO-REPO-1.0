import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /admin → redirect to /admin/products
 */
export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/products" });
  },
  component: () => null,
});
