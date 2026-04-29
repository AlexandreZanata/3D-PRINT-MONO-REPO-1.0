import { useMutation } from "@tanstack/react-query";
import { login, logout } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials } from "../types";

/**
 * Provides login and logout mutations wired to the authStore.
 * On login success: stores accessToken + adminUser in Zustand.
 * On logout: clears the session.
 *
 * All store reads are consolidated into a single selector to prevent
 * cascading re-renders (Maximum update depth exceeded).
 */
export function useAuth() {
  const { setTokens, clearSession, isAuthenticated, adminUser } = useAuthStore((s) => ({
    setTokens: s.setTokens,
    clearSession: s.clearSession,
    isAuthenticated: s.isAuthenticated,
    adminUser: s.adminUser,
  }));

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (session) => {
      setTokens(session.accessToken, session.adminUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSession();
    },
    onError: () => {
      // Clear session even if the server call fails
      clearSession();
    },
  });

  return {
    login: loginMutation,
    logout: logoutMutation,
    isAuthenticated,
    adminUser,
  };
}
