import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoginForm } from "@/organisms/LoginForm/LoginForm";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl mb-8 text-center">Admin login</h1>
        <LoginForm
          onSubmit={(values) => {
            login.mutate(values, {
              onSuccess: () => void navigate({ to: "/admin/products" }),
            });
          }}
          isLoading={login.isPending}
          error={login.isError ? "Invalid email or password." : undefined}
        />
      </div>
    </div>
  );
}
