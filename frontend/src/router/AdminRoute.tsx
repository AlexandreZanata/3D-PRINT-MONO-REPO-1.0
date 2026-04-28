import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Extends ProtectedRoute — also checks that the user has role "admin".
 * Redirects to "/" if unauthenticated or not admin.
 * Will redirect to "/login" once that route is added to the router.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, adminUser } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    adminUser: s.adminUser,
  }));
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || adminUser?.role !== "admin") {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, adminUser, navigate]);

  if (!isAuthenticated || adminUser?.role !== "admin") return null;

  return <>{children}</>;
}
