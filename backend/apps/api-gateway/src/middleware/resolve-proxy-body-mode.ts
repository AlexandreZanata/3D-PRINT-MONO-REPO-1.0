export type ProxyBodyMode = "json-stringify" | "multipart-pipe" | "none";

function firstContentTypeHeader(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return undefined;
}

/**
 * How the gateway should forward the request body to upstream.
 * Multipart must be streamed (`req.pipe`); JSON bodies are re-serialized from `req.body`.
 */
export function resolveProxyBodyMode(
  method: string,
  contentTypeHeader: string | string[] | undefined,
  parsedBody: unknown,
): ProxyBodyMode {
  if (!["POST", "PUT", "PATCH"].includes(method)) return "none";
  const ct = firstContentTypeHeader(contentTypeHeader);
  if (typeof ct === "string" && ct.toLowerCase().includes("multipart/form-data")) {
    return "multipart-pipe";
  }
  if (parsedBody !== undefined) return "json-stringify";
  return "none";
}
