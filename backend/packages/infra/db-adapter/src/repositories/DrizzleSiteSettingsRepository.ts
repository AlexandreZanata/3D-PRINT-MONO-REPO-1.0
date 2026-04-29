// @max-lines 200 — this is enforced by the lint pipeline.
import type { ISiteSettingsRepository, SiteSettingsMap } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { DbClient } from "../client.js";
import { siteSettingsTable } from "../schema/index.js";

export class DrizzleSiteSettingsRepository implements ISiteSettingsRepository {
  constructor(private readonly db: DbClient) {}

  async findAll(): Promise<Result<SiteSettingsMap, InfraError>> {
    try {
      const rows = await this.db.select().from(siteSettingsTable);
      const map: Record<string, string> = {};
      for (const row of rows) {
        map[row.key] = row.value;
      }
      return ok(map as SiteSettingsMap);
    } catch (e) {
      return err(new InfraError("findAll failed", toError(e), "DB_ERROR"));
    }
  }

  async upsert(key: string, value: string): Promise<Result<void, InfraError>> {
    try {
      await this.db
        .insert(siteSettingsTable)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteSettingsTable.key,
          set: { value, updatedAt: new Date() },
        });
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("upsert failed", toError(e), "DB_ERROR"));
    }
  }

  async upsertMany(entries: Record<string, string>): Promise<Result<void, InfraError>> {
    const keys = Object.keys(entries);
    if (keys.length === 0) return ok(undefined);
    try {
      await this.db.transaction(async (tx) => {
        for (const key of keys) {
          const value = entries[key];
          // value is always a string here — entries is Record<string, string>
          if (value === undefined) continue;
          await tx
            .insert(siteSettingsTable)
            .values({ key, value, updatedAt: new Date() })
            .onConflictDoUpdate({
              target: siteSettingsTable.key,
              set: { value, updatedAt: new Date() },
            });
        }
      });
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("upsertMany failed", toError(e), "DB_ERROR"));
    }
  }
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
