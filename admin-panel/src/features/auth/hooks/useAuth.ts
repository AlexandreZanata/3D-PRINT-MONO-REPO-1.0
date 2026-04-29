import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { login, logout } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials } from "../types";

/**
 * Login/logout mutations wired to authStore.
 * useShallow avoids unstable object selectors from Zustand.
 */
export function useAuth() {
  const { setTokens, clearSession, isAuthenticated, adminUser } = useAuthStore(
    useShallow((s) => ({
      setTokens: s.setTokens,
      clearSession: s.clearSession,
      isAuthenticated: s.isAuthenticated,
      adminUser: s.adminUser,
    })),
  );

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (session) => {
      setTokens(session.accessToken, session.adminUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      clearSession();
    },
    onError: () => {
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
