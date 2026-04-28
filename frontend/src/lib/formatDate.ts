/**
 * Formats an ISO 8601 date string into a human-readable date.
 *
 * @example formatDate("2026-04-28T14:00:00Z") → "Apr 28, 2026"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Formats an ISO 8601 date string into a date + time string.
 *
 * @example formatDateTime("2026-04-28T14:30:00Z") → "Apr 28, 2026, 2:30 PM"
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
