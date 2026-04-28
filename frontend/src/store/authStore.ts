import { create } from "zustand";

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly role: string;
}

interface AuthState {
  accessToken: string | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  csrfToken: string | null;
}

interface AuthActions {
  setTokens: (accessToken: string, user: AdminUser, csrfToken?: string) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

/**
 * Global auth store.
 * accessToken lives in memory only — never persisted to localStorage.
 * refreshToken is an HttpOnly cookie managed by the browser automatically.
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  accessToken: null,
  adminUser: null,
  isAuthenticated: false,
  csrfToken: null,

  setTokens: (accessToken, adminUser, csrfToken) =>
    set({ accessToken, adminUser, isAuthenticated: true, csrfToken: csrfToken ?? null }),

  setAccessToken: (accessToken) => set({ accessToken }),

  clearSession: () =>
    set({ accessToken: null, adminUser: null, isAuthenticated: false, csrfToken: null }),
}));
