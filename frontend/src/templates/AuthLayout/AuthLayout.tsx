import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  /** Optional title shown above the card */
  title?: string;
}

/**
 * AuthLayout template — centered card layout for login and auth pages.
 * Defines the slot structure. No data fetching.
 */
export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {title && (
          <h1 className="font-display text-4xl mb-8 text-center">{title}</h1>
        )}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
