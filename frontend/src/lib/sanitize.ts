/**
 * Strips HTML tags from a string to prevent XSS when displaying user-supplied content.
 * Uses a simple regex — for rich content, use DOMPurify instead.
 *
 * @example sanitize("<b>Hello</b> world") → "Hello world"
 * @example sanitize("<script>alert(1)</script>") → "alert(1)"
 */
export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}
