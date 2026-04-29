import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAdminSiteSettings, useUpdateSiteSettings } from "@/features/admin/hooks/useAdminSiteSettings";
import { FormField } from "@/molecules/FormField/FormField";

export const Route = createFileRoute("/admin/site-settings")({
  head: () => ({ meta: [{ title: "Site Settings — Forma Admin" }] }),
  component: AdminSiteSettingsPage,
});

interface SettingsFormValues {
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

function AdminSiteSettingsPage() {
  const { data: settings, isLoading } = useAdminSiteSettings();
  const updateMutation = useUpdateSiteSettings();

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<SettingsFormValues>();

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

  const onSubmit = (values: SettingsFormValues) => {
    updateMutation.mutate(values as unknown as Record<string, string>);
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading settings…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Site Settings</h1>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-8" noValidate>

        {/* Hero section */}
        <section className="space-y-4">
          <h2 className="font-display text-xl border-b border-border pb-2">Hero Section</h2>
          <FormField id="hero.badgeText" label="Badge text" error={errors["hero.badgeText"]?.message}
            inputProps={{ ...register("hero.badgeText"), type: "text", placeholder: "Studio · 2026 collection" }} />
          <FormField id="hero.headline" label="Headline" as="textarea" error={errors["hero.headline"]?.message}
            inputProps={{ ...register("hero.headline"), rows: 2, placeholder: "Objects, printed\nin quiet detail." }} />
          <FormField id="hero.subheadline" label="Subheadline" as="textarea" error={errors["hero.subheadline"]?.message}
            inputProps={{ ...register("hero.subheadline"), rows: 3 }} />
          <FormField id="hero.imageUrl" label="Hero image URL" error={errors["hero.imageUrl"]?.message}
            inputProps={{ ...register("hero.imageUrl"), type: "url", placeholder: "https://example.com/hero.jpg" }} />
          <div className="grid grid-cols-2 gap-4">
            <FormField id="hero.ctaLabel" label="CTA button label" error={errors["hero.ctaLabel"]?.message}
              inputProps={{ ...register("hero.ctaLabel"), type: "text", placeholder: "Shop the collection" }} />
            <FormField id="hero.ctaLink" label="CTA button link" error={errors["hero.ctaLink"]?.message}
              inputProps={{ ...register("hero.ctaLink"), type: "text", placeholder: "/shop" }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="hero.secondaryLabel" label="Secondary button label" error={errors["hero.secondaryLabel"]?.message}
              inputProps={{ ...register("hero.secondaryLabel"), type: "text", placeholder: "Lighting" }} />
            <FormField id="hero.secondaryLink" label="Secondary button link" error={errors["hero.secondaryLink"]?.message}
              inputProps={{ ...register("hero.secondaryLink"), type: "text", placeholder: "/shop?category=Lighting" }} />
          </div>
        </section>

        {/* Featured section */}
        <section className="space-y-4">
          <h2 className="font-display text-xl border-b border-border pb-2">Featured Section</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="featured.badge" label="Badge text" error={errors["featured.badge"]?.message}
              inputProps={{ ...register("featured.badge"), type: "text", placeholder: "Featured" }} />
            <FormField id="featured.title" label="Section title" error={errors["featured.title"]?.message}
              inputProps={{ ...register("featured.title"), type: "text", placeholder: "Newly in the studio" }} />
          </div>
        </section>

        {/* Story cards */}
        <section className="space-y-4">
          <h2 className="font-display text-xl border-b border-border pb-2">Story Cards</h2>
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="space-y-2 p-4 border border-border rounded-xl">
              <p className="text-sm font-medium text-muted-foreground">Card {n}</p>
              <FormField id={`story.card${n}.title`} label="Title"
                error={errors[`story.card${n}.title` as keyof SettingsFormValues]?.message}
                inputProps={{ ...register(`story.card${n}.title` as keyof SettingsFormValues), type: "text" }} />
              <FormField id={`story.card${n}.body`} label="Body" as="textarea"
                error={errors[`story.card${n}.body` as keyof SettingsFormValues]?.message}
                inputProps={{ ...register(`story.card${n}.body` as keyof SettingsFormValues), rows: 2 }} />
            </div>
          ))}
        </section>

        {/* Footer */}
        <section className="space-y-4">
          <h2 className="font-display text-xl border-b border-border pb-2">Footer</h2>
          <FormField id="footer.copyright" label="Copyright text" error={errors["footer.copyright"]?.message}
            inputProps={{ ...register("footer.copyright"), type: "text", placeholder: "© 2026 Forma Studio." }} />
        </section>

        {updateMutation.isError && (
          <p role="alert" className="text-sm text-destructive">Failed to save settings. Please try again.</p>
        )}
        {updateMutation.isSuccess && (
          <p className="text-sm text-green-700">Settings saved successfully.</p>
        )}

        <button type="submit" disabled={updateMutation.isPending}
          className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {updateMutation.isPending ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
