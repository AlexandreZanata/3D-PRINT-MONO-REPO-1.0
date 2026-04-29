// @max-lines 200 — this is enforced by the lint pipeline.
import type { Result } from "@repo/utils";
import type { SiteSettingsDTO } from "../dtos/ProductDTO.js";
import type { GetSiteSettingsUseCase } from "../use-cases/site-settings/GetSiteSettingsUseCase.js";
import type { UpdateSiteSettingsUseCase } from "../use-cases/site-settings/UpdateSiteSettingsUseCase.js";

export interface SiteSettingsFacadeDeps {
  readonly getSettings: GetSiteSettingsUseCase;
  readonly updateSettings: UpdateSiteSettingsUseCase;
}

/** Orchestrates site settings use cases. */
export class SiteSettingsFacade {
  constructor(private readonly deps: SiteSettingsFacadeDeps) {}

  get(): Promise<Result<SiteSettingsDTO, Error>> {
    return this.deps.getSettings.execute();
  }

  update(entries: Record<string, string>): Promise<Result<SiteSettingsDTO, Error>> {
    return this.deps.updateSettings.execute(entries);
  }
}
