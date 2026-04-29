import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAdminSiteSettings, useUpdateSiteSettings } from "@/features/admin/hooks/useAdminSiteSettings";
import { settingsFormToRecord } from "@/lib/settingsFormToRecord";
import { SiteSettingsField } from "./SiteSettingsField";

interface SettingsForm {
  "hero.badgeText": string;
  "hero.headline": string;
  "hero.subheadline": string;
  "hero.imageUrl": string;
  "hero.ctaLabel": string;
  "hero.ctaLink": string;
  "hero.secondaryLabel": string;
  "hero.secondaryLink": string;
  "featured.title": string;
  "featured.badge": string;
  "story.card1.title": string;
  "story.card1.body": string;
  "story.card2.title": string;
  "story.card2.body": string;
  "story.card3.title": string;
  "story.card3.body": string;
  "footer.copyright": string;
}

const STORY_FIELDS = [
  { title: "story.card1.title", body: "story.card1.body", n: 1 },
  { title: "story.card2.title", body: "story.card2.body", n: 2 },
  { title: "story.card3.title", body: "story.card3.body", n: 3 },
] as const;

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-colors";

export function SiteSettingsEditor() {
  const { data: settings, isLoading } = useAdminSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (settings) {
      reset({
        "hero.badgeText": settings["hero.badgeText"] ?? "",
        "hero.headline": settings["hero.headline"] ?? "",
        "hero.subheadline": settings["hero.subheadline"] ?? "",
        "hero.imageUrl": settings["hero.imageUrl"] ?? "",
        "hero.ctaLabel": settings["hero.ctaLabel"] ?? "",
        "hero.ctaLink": settings["hero.ctaLink"] ?? "",
        "hero.secondaryLabel": settings["hero.secondaryLabel"] ?? "",
        "hero.secondaryLink": settings["hero.secondaryLink"] ?? "",
        "featured.title": settings["featured.title"] ?? "",
        "featured.badge": settings["featured.badge"] ?? "",
        "story.card1.title": settings["story.card1.title"] ?? "",
        "story.card1.body": settings["story.card1.body"] ?? "",
        "story.card2.title": settings["story.card2.title"] ?? "",
        "story.card2.body": settings["story.card2.body"] ?? "",
        "story.card3.title": settings["story.card3.title"] ?? "",
        "story.card3.body": settings["story.card3.body"] ?? "",
        "footer.copyright": settings["footer.copyright"] ?? "",
      });
    }
  }, [settings, reset]);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Site Settings</h1>

      <form
        onSubmit={(e) =>
          void handleSubmit((values) => {
            updateMutation.mutate(settingsFormToRecord(values));
          })(e)
        }
        className="space-y-8"
        noValidate
      >
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Hero Section
          </h2>
          <SiteSettingsField label="Badge text" id="hero.badgeText">
            <input
              id="hero.badgeText"
              {...register("hero.badgeText")}
              className={inputCls}
              placeholder="Studio · 2026 collection"
            />
          </SiteSettingsField>
          <SiteSettingsField label="Headline" id="hero.headline">
            <textarea id="hero.headline" {...register("hero.headline")} rows={2} className={inputCls} />
          </SiteSettingsField>
          <SiteSettingsField label="Subheadline" id="hero.subheadline">
            <textarea id="hero.subheadline" {...register("hero.subheadline")} rows={3} className={inputCls} />
          </SiteSettingsField>
          <SiteSettingsField label="Hero image URL" id="hero.imageUrl">
            <input
              id="hero.imageUrl"
              type="url"
              {...register("hero.imageUrl")}
              className={inputCls}
              placeholder="https://..."
            />
          </SiteSettingsField>
          <div className="grid grid-cols-2 gap-4">
            <SiteSettingsField label="CTA label" id="hero.ctaLabel">
              <input id="hero.ctaLabel" {...register("hero.ctaLabel")} className={inputCls} />
            </SiteSettingsField>
            <SiteSettingsField label="CTA link" id="hero.ctaLink">
              <input id="hero.ctaLink" {...register("hero.ctaLink")} className={inputCls} />
            </SiteSettingsField>
            <SiteSettingsField label="Secondary label" id="hero.secondaryLabel">
              <input id="hero.secondaryLabel" {...register("hero.secondaryLabel")} className={inputCls} />
            </SiteSettingsField>
            <SiteSettingsField label="Secondary link" id="hero.secondaryLink">
              <input id="hero.secondaryLink" {...register("hero.secondaryLink")} className={inputCls} />
            </SiteSettingsField>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Featured Section
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <SiteSettingsField label="Badge" id="featured.badge">
              <input id="featured.badge" {...register("featured.badge")} className={inputCls} />
            </SiteSettingsField>
            <SiteSettingsField label="Title" id="featured.title">
              <input id="featured.title" {...register("featured.title")} className={inputCls} />
            </SiteSettingsField>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Story Cards</h2>
          {STORY_FIELDS.map(({ title, body, n }) => (
            <div
              key={n}
              className="grid grid-cols-2 gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
            >
              <SiteSettingsField label={`Card ${String(n)} title`} id={title}>
                <input id={title} {...register(title)} className={inputCls} />
              </SiteSettingsField>
              <SiteSettingsField label={`Card ${String(n)} body`} id={body}>
                <textarea id={body} {...register(body)} rows={2} className={inputCls} />
              </SiteSettingsField>
            </div>
          ))}
        </section>

        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Footer</h2>
          <SiteSettingsField label="Copyright text" id="footer.copyright">
            <input id="footer.copyright" {...register("footer.copyright")} className={inputCls} />
          </SiteSettingsField>
        </section>

        {updateMutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            Failed to save. Please try again.
          </p>
        )}
        {updateMutation.isSuccess && (
          <p className="text-sm text-green-700">Settings saved successfully.</p>
        )}

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
