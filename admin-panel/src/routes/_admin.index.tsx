import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * `/` only mounts the pathless `_admin` layout; without an index child the outlet
 * had no matching leaf route → Not Found. Redirect the dashboard root to products.
 */
function AdminIndexRedirect(): null {
  return null;
}

export const Route = createFileRoute("/_admin/")({
  component: AdminIndexRedirect,
  beforeLoad: () => {
    throw redirect({ to: "/products" });
  },
});
