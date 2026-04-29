import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { AdminAppShell } from "@/templates/AdminAppShell";

export const Route = createFileRoute("/_admin")({
  beforeLoad: () => {
    const { isAuthenticated, adminUser } = useAuthStore.getState();
    if (!isAuthenticated) throw redirect({ to: "/login" });
    if (adminUser?.role !== "admin") throw redirect({ to: "/login" });
  },
  component: AdminAppShell,
});
