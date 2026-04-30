function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isMulterFileSizeError(err: unknown): boolean {
  if (!isRecord(err)) return false;
  return err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE";
}

export function isUnsupportedImageUploadError(err: unknown): boolean {
  return err instanceof Error && err.message === "UNSUPPORTED_IMAGE_TYPE";
}
