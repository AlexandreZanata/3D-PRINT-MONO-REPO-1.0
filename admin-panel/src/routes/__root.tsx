import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import "../styles/globals.css";
import { AppProviders } from "@/AppProviders";

function RootNotFound() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-medium">Page not found</p>
      <p className="text-sm text-muted-foreground">
        Try <Link to="/login" className="underline underline-offset-4">Sign in</Link> or{" "}
        <Link to="/products" className="underline underline-offset-4">Products</Link>.
      </p>
    </div>
  );
}

export const Route = createRootRoute({
  notFoundComponent: RootNotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Forma Admin" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { --background: oklch(0.985 0.002 240); }
              html { background-color: oklch(0.985 0.002 240); }
              body { background-color: oklch(0.985 0.002 240); margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
            `,
          }}
        />
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
      <Outlet />
    </AppProviders>
  );
}
