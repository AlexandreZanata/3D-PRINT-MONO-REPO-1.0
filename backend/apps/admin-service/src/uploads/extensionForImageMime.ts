/** Maps allowed image MIME types to a stable file extension (ignore client filename). */
export function extensionForImageMime(mime: string): ".jpg" | ".png" | ".webp" | null {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return null;
  }
}
