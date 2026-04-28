/**
 * Builds a wa.me deep-link URL from a phone number and optional message.
 * The frontend should prefer calling the backend endpoint
 * GET /api/v1/products/:id/whatsapp instead of constructing this client-side.
 * This utility is provided for offline/fallback use only.
 *
 * @example buildWhatsappUrl("+5511999999999", "Hi!") → "https://wa.me/5511999999999?text=Hi!"
 */
export function buildWhatsappUrl(phoneNumber: string, message?: string): string {
  // Strip all non-digit characters except leading +
  const digits = phoneNumber.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
