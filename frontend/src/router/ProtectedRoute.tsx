import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Route to redirect to when unauthenticated. Defaults to "/" until /login exists. */
  redirectTo?: "/";
}

/**
 * Redirects unauthenticated users to the specified route (default: "/").
 * Will redirect to "/login" once that route is added to the router.
 * Uses TanStack Router navigation — compatible with file-based routing.
 */
export function ProtectedRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: redirectTo });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
