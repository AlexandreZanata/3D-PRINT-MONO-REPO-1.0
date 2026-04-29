/**
 * Converts a settings form (all string fields) to the API payload type.
 */
export function settingsFormToRecord(form: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(form)) {
    if (typeof v === "string") {
      out[k] = v;
    }
  }
  return out;
}
