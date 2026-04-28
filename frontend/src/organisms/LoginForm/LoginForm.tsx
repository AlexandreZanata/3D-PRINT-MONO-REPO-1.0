import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/molecules/FormField/FormField";

/**
 * Frontend Zod v4 schema mirroring @repo/contracts LoginSchema (Zod v3).
 * Defined locally because @repo/contracts uses Zod v3 which is incompatible
 * with the frontend's Zod v4 resolver.
 */
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading?: boolean;
  error?: string;
}

/**
 * LoginForm organism — React Hook Form + Zod validation.
 * Calls onSubmit with validated values. No API calls inside this component.
 */
export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
      <FormField
        id="email"
        label="Email"
        error={errors.email?.message}
        inputProps={{
          ...register("email"),
          type: "email",
          autoComplete: "email",
          placeholder: "admin@example.com",
        }}
      />

      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
        inputProps={{
          ...register("password"),
          type: "password",
          autoComplete: "current-password",
        }}
      />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-foreground text-background py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
