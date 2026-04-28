/**
 * Formats a numeric amount as a USD currency string.
 * Uses Intl.NumberFormat for locale-aware formatting.
 *
 * @example formatCurrency(49.99) → "$49.99"
 * @example formatCurrency(0)     → "$0"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
