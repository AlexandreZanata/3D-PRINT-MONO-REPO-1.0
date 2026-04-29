// @max-lines 200 — this is enforced by the lint pipeline.
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Generic key-value store for admin-editable site content.
 * Keys use dot-notation namespacing: hero.headline, footer.copyright, etc.
 */
export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteSettingSelectModel = typeof siteSettingsTable.$inferSelect;
export type SiteSettingInsertModel = typeof siteSettingsTable.$inferInsert;
