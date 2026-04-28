import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    // Redirect to admin if already authenticated
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/admin/products" });
    }
  },
  head: () => ({
    meta: [{ title: "Login — Forma Admin" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    if (typeof email !== "string" || typeof password !== "string") return;

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          void navigate({ to: "/admin/products" });
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl mb-8 text-center">Admin login</h1>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          {login.isError && (
            <p className="text-sm text-destructive">Invalid email or password.</p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-full bg-foreground text-background py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
