import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { SyntheticEvent } from "react";
// Import CSS normally — TanStack Start's dev-server plugin crawls the module
// graph and collects all CSS imports into /@tanstack-start/styles.css, which
// is injected as a <link rel="stylesheet"> in the SSR HTML. This is the
// correct pattern: no ?url, no virtual modules, no FOUC.
import "../styles/globals.css";
import { AppProviders } from "@/AppProviders";
import { SiteHeader } from "@/organisms/SiteHeader/SiteHeader";
import { MobileTabBar } from "@/organisms/MobileTabBar/MobileTabBar";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600;700&display=swap";

function activateFontStylesheet(e: SyntheticEvent<HTMLLinkElement>): void {
  e.currentTarget.media = "all";
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm text-background hover:opacity-90 transition-opacity"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f5f3ee" },
      { title: "Forma — 3D printed objects for everyday rituals" },
      {
        name: "description",
        content:
          "Forma designs and 3D prints sculptural objects for the home. Made to order, made to last.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Critical inline styles first so base colors/layout exist before
          HeadContent injects the app stylesheet and Google Fonts (async below).
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --background: oklch(0.975 0.006 80);
            --foreground: oklch(0.18 0.005 50);
          }
          html { background-color: oklch(0.975 0.006 80); }
          body {
            background-color: oklch(0.975 0.006 80);
            color: oklch(0.18 0.005 50);
            margin: 0;
            font-family: ui-sans-serif, system-ui, sans-serif;
          }
          .forma-shell {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
        `}} />
        <HeadContent />
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} media="print" onLoad={activateFontStylesheet} />
        <noscript>
          <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppProviders>
      <div className="forma-shell min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </AppProviders>
  );
}
