import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Extends ProtectedRoute — also checks that the user has role "admin".
 * Redirects to /login if unauthenticated, or to / if authenticated but not admin.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, adminUser } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    adminUser: s.adminUser,
  }));
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
