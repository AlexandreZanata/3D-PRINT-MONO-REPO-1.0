/**
 * poc.ts — minimum working usage of DrizzleSiteSettingsRepository
 *
 * Run: npx tsx backend/packages/infra/db-adapter/poc.ts
 * Requires: POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD env vars
 */
import { createDbClient } from "./src/client.js";
import { DrizzleSiteSettingsRepository } from "./src/repositories/DrizzleSiteSettingsRepository.js";

async function main() {
  const { db, close } = createDbClient({
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? "ecommerce",
    user: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "",
  });

  const repo = new DrizzleSiteSettingsRepository(db);

  // 1. Upsert a single key
  const upsertResult = await repo.upsert("hero.headline", "Objects, printed\nin quiet detail.");
  console.info("upsert:", upsertResult.ok ? "ok" : upsertResult.error.message);

  // 2. Upsert multiple keys at once
  const batchResult = await repo.upsertMany({
    "hero.badgeText": "Studio · 2026 collection",
    "footer.copyright": "© 2026 Forma Studio. All rights reserved.",
  });
  console.info("upsertMany:", batchResult.ok ? "ok" : batchResult.error.message);

  // 3. Read all settings back
  const allResult = await repo.findAll();
  if (allResult.ok) {
    console.info("settings:", allResult.value);
  } else {
    console.error("findAll error:", allResult.error.message);
  }

  await close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
