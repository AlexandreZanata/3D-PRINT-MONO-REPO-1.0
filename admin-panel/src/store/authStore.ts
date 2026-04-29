import { create } from "zustand";

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  csrfToken: string | null;
}

interface AuthActions {
  setTokens: (accessToken: string, user: AdminUser, refreshToken: string, csrfToken?: string) => void;
  setAccessToken: (token: string) => void;
  setTokenPair: (accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  accessToken: null,
  refreshToken: null,
  adminUser: null,
  isAuthenticated: false,
  csrfToken: null,
  setTokens: (accessToken, adminUser, refreshToken, csrfToken) =>
    set({
      accessToken,
      refreshToken,
      adminUser,
      isAuthenticated: true,
      csrfToken: csrfToken ?? null,
    }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setTokenPair: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      adminUser: null,
      isAuthenticated: false,
      csrfToken: null,
    }),
}));
