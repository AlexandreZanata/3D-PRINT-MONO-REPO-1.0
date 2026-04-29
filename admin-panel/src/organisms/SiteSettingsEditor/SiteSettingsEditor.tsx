import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAdminSiteSettings, useUpdateSiteSettings } from "@/features/admin/hooks/useAdminSiteSettings";
import { settingsFormToRecord } from "@/lib/settingsFormToRecord";
import { SiteSettingsField } from "./SiteSettingsField";
import { SiteSettingsFormSection } from "./SiteSettingsFormSection";
import {
  SITE_SETTINGS_FORM_ID,
  SITE_SETTINGS_INPUT_CLASS,
  STORY_CARD_FIELDS,
} from "./siteSettingsEditor.constants";
import type { SiteSettingsFormValues } from "./siteSettingsEditor.types";

export function SiteSettingsEditor() {
  const { data: settings, isLoading } = useAdminSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const { register, handleSubmit, reset } = useForm<SiteSettingsFormValues>();

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
      <div className="w-full space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-muted/80 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Site settings</h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Edit homepage copy and links shown on the public storefront. Changes apply after save.
          </p>
        </div>
        <button
          type="submit"
          form={SITE_SETTINGS_FORM_ID}
          disabled={updateMutation.isPending}
          className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving…" : "Save changes"}
        </button>
      </header>

      <form
        id={SITE_SETTINGS_FORM_ID}
        onSubmit={(e) =>
          void handleSubmit((values) => {
            updateMutation.mutate(settingsFormToRecord(values));
          })(e)
        }
        className="space-y-8"
        noValidate
      >
        <SiteSettingsFormSection
          title="Hero"
          description="Above-the-fold headline, imagery, and primary calls to action."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-5">
              <SiteSettingsField label="Badge text" id="hero.badgeText">
                <input
                  id="hero.badgeText"
                  {...register("hero.badgeText")}
                  className={SITE_SETTINGS_INPUT_CLASS}
                  placeholder="Studio · 2026 collection"
                />
              </SiteSettingsField>
              <SiteSettingsField label="Headline" id="hero.headline">
                <textarea id="hero.headline" {...register("hero.headline")} rows={3} className={SITE_SETTINGS_INPUT_CLASS} />
              </SiteSettingsField>
              <SiteSettingsField label="Subheadline" id="hero.subheadline">
                <textarea id="hero.subheadline" {...register("hero.subheadline")} rows={4} className={SITE_SETTINGS_INPUT_CLASS} />
              </SiteSettingsField>
            </div>
            <div className="space-y-5">
              <SiteSettingsField label="Hero image URL" id="hero.imageUrl">
                <input
                  id="hero.imageUrl"
                  type="url"
                  {...register("hero.imageUrl")}
                  className={SITE_SETTINGS_INPUT_CLASS}
                  placeholder="https://…"
                />
              </SiteSettingsField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SiteSettingsField label="CTA label" id="hero.ctaLabel">
                  <input id="hero.ctaLabel" {...register("hero.ctaLabel")} className={SITE_SETTINGS_INPUT_CLASS} />
                </SiteSettingsField>
                <SiteSettingsField label="CTA link" id="hero.ctaLink">
                  <input id="hero.ctaLink" {...register("hero.ctaLink")} className={SITE_SETTINGS_INPUT_CLASS} />
                </SiteSettingsField>
                <SiteSettingsField label="Secondary label" id="hero.secondaryLabel">
                  <input id="hero.secondaryLabel" {...register("hero.secondaryLabel")} className={SITE_SETTINGS_INPUT_CLASS} />
                </SiteSettingsField>
                <SiteSettingsField label="Secondary link" id="hero.secondaryLink">
                  <input id="hero.secondaryLink" {...register("hero.secondaryLink")} className={SITE_SETTINGS_INPUT_CLASS} />
                </SiteSettingsField>
              </div>
            </div>
          </div>
        </SiteSettingsFormSection>

        <SiteSettingsFormSection title="Featured" description="Badge and title for the featured products strip.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SiteSettingsField label="Badge" id="featured.badge">
              <input id="featured.badge" {...register("featured.badge")} className={SITE_SETTINGS_INPUT_CLASS} />
            </SiteSettingsField>
            <SiteSettingsField label="Title" id="featured.title">
              <input id="featured.title" {...register("featured.title")} className={SITE_SETTINGS_INPUT_CLASS} />
            </SiteSettingsField>
          </div>
        </SiteSettingsFormSection>

        <SiteSettingsFormSection title="Story cards" description="Three supporting blocks below the hero.">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {STORY_CARD_FIELDS.map(({ title, body, n }) => (
              <div
                key={n}
                className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-4 dark:bg-muted/10"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Card {String(n)}
                </p>
                <SiteSettingsField label="Title" id={title}>
                  <input id={title} {...register(title)} className={SITE_SETTINGS_INPUT_CLASS} />
                </SiteSettingsField>
                <SiteSettingsField label="Body" id={body}>
                  <textarea id={body} {...register(body)} rows={3} className={SITE_SETTINGS_INPUT_CLASS} />
                </SiteSettingsField>
              </div>
            ))}
          </div>
        </SiteSettingsFormSection>

        <SiteSettingsFormSection title="Footer" description="Legal line at the bottom of the site.">
          <SiteSettingsField label="Copyright text" id="footer.copyright">
            <input id="footer.copyright" {...register("footer.copyright")} className={SITE_SETTINGS_INPUT_CLASS} />
          </SiteSettingsField>
        </SiteSettingsFormSection>

        {updateMutation.isError ? (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Failed to save. Please try again.
          </p>
        ) : null}
        {updateMutation.isSuccess ? (
          <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            Settings saved successfully.
          </p>
        ) : null}
      </form>
    </div>
  );
}
