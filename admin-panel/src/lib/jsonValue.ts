export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

/**
 * Coerces an arbitrary JSON-compatible value from the API into JsonValue.
 * Throws if the value contains unsupported types (e.g. function, undefined).
 */
export function coerceJsonValue(value: unknown): JsonValue {
  if (value === null) return null;

  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value.map((item) => coerceJsonValue(item));
  }

  if (typeof value === "object" && value !== null) {
    const out: Record<string, JsonValue> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = coerceJsonValue(v);
    }
    return out;
  }

  throw new Error(`Unsupported JSON value type: ${typeof value}`);
}
