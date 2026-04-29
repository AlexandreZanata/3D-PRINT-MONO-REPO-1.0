// @max-lines 200 — this is enforced by the lint pipeline.

/**
 * A single site setting entry.
 * Keys use dot-notation namespacing: hero.headline, footer.copyright, etc.
 */
export interface SiteSettingProps {
  readonly key: string;
  readonly value: string;
  readonly updatedAt: Date;
}

/** Immutable value object representing one site setting. */
export class SiteSetting {
  private readonly props: SiteSettingProps;

  private constructor(props: SiteSettingProps) {
    this.props = props;
  }

  static create(key: string, value: string): SiteSetting {
    return new SiteSetting({ key, value, updatedAt: new Date() });
  }

  static reconstitute(props: SiteSettingProps): SiteSetting {
    return new SiteSetting(props);
  }

  get key(): string {
    return this.props.key;
  }

  get value(): string {
    return this.props.value;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

/**
 * Typed view of all site settings, assembled from the flat key-value store.
 * All fields are optional — missing keys fall back to defaults in the use case.
 */
export interface SiteSettingsMap {
  readonly [key: string]: string;
}
