// MIGRATED FROM: src/routes/__root.tsx (RootComponent) — extracted into template layer
import type { ReactNode } from "react";
import { SiteHeader } from "@/organisms/SiteHeader/SiteHeader";
import { MobileTabBar } from "@/organisms/MobileTabBar/MobileTabBar";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * PublicLayout — wraps all public-facing pages.
 * Provides the sticky header, main content area, and mobile tab bar.
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileTabBar />
    </div>
  );
}
