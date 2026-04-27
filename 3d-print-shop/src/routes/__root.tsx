import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { CartProvider } from "@/lib/cart";
import { SiteHeader, MobileTabBar } from "@/components/SiteChrome";

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
          "Forma designs and 3D prints sculptural objects for the home — vases, lighting, tableware, and more. Made to order, made to last.",
      },
      { name: "author", content: "Forma" },
      { property: "og:title", content: "Forma — 3D printed objects for everyday rituals" },
      {
        property: "og:description",
        content: "Sculptural 3D printed objects for the home. Made to order, made to last.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
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
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </CartProvider>
  );
}
