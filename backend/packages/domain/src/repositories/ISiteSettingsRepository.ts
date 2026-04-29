// @max-lines 200 — this is enforced by the lint pipeline.
import type { Result } from "../common/Result.js";
import type { InfraError } from "../common/index.js";
import type { SiteSettingsMap } from "../entities/SiteSettings.js";

export interface ISiteSettingsRepository {
  /** Returns all settings as a flat key→value map. */
  findAll(): Promise<Result<SiteSettingsMap, InfraError>>;
  /** Upserts a single key. */
  upsert(key: string, value: string): Promise<Result<void, InfraError>>;
  /** Upserts multiple keys in a single transaction. */
  upsertMany(entries: Record<string, string>): Promise<Result<void, InfraError>>;
}
