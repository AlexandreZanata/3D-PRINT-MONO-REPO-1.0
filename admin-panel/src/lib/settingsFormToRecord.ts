/**
 * Converts a string-keyed form object to a plain record for the site-settings API.
 */
export function settingsFormToRecord<T extends Record<string, string>>(form: T): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(form) as (keyof T)[]) {
    out[String(key)] = form[key];
  }
  return out;
}
