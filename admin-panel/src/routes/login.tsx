import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/products" });
    }
  },
  head: () => ({ meta: [{ title: "Login — Forma Admin" }] }),
  component: LoginPage,
});

interface LoginValues {
  email: string;
  password: string;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Forma Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your store</p>
        </div>

        <form
          onSubmit={(e) =>
            void handleSubmit((values) => {
              login.mutate(values, {
                onSuccess: () => {
                  void navigate({ to: "/products" });
                },
              });
            })(e)
          }
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              {...register("email", { required: "Email is required" })}
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors",
                "focus:ring-2 focus:ring-ring",
                errors.email ? "border-destructive" : "border-input",
              )}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "Password is required" })}
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors",
                "focus:ring-2 focus:ring-ring",
                errors.password ? "border-destructive" : "border-input",
              )}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {login.isError && (
            <p role="alert" className="text-sm text-destructive">
              Invalid email or password.
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
