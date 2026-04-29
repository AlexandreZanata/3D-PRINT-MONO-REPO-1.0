import { createFileRoute } from "@tanstack/react-router";
import { SiteSettingsEditor } from "@/organisms/SiteSettingsEditor";

export const Route = createFileRoute("/_admin/site-settings")({
  head: () => ({ meta: [{ title: "Site Settings — Forma Admin" }] }),
  component: SiteSettingsRoute,
});

function SiteSettingsRoute() {
  return <SiteSettingsEditor />;
}
