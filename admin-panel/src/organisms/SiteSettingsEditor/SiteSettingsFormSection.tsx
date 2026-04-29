import type { ReactNode } from "react";

interface SiteSettingsFormSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}

export function SiteSettingsFormSection({ title, description, children }: SiteSettingsFormSectionProps) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06] p-6 md:p-8">
      <header className="mb-6 pb-5 border-b border-border/80">
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-6 w-1 shrink-0 rounded-full bg-primary/85"
            aria-hidden
          />
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            ) : null}
          </div>
        </div>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
