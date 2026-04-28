import { useMutation } from "@tanstack/react-query";
import { login, logout } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials } from "../types";

/**
 * Provides login and logout mutations wired to the authStore.
 * On login success: stores accessToken + adminUser in Zustand.
 * On logout: clears the session.
 */
export function useAuth() {
  const { setTokens, clearSession } = useAuthStore((s) => ({
    setTokens: s.setTokens,
    clearSession: s.clearSession,
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
    isAuthenticated: useAuthStore((s) => s.isAuthenticated),
    adminUser: useAuthStore((s) => s.adminUser),
  };
}
