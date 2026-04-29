export const SITE_SETTINGS_FORM_ID = "site-settings-form";

export const SITE_SETTINGS_INPUT_CLASS =
  "w-full min-h-10 rounded-lg border border-input/80 bg-background px-3 py-2 text-sm shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export const STORY_CARD_FIELDS = [
  { title: "story.card1.title" as const, body: "story.card1.body" as const, n: 1 },
  { title: "story.card2.title" as const, body: "story.card2.body" as const, n: 2 },
  { title: "story.card3.title" as const, body: "story.card3.body" as const, n: 3 },
];
