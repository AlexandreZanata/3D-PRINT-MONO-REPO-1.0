import { randomUUID } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import multer from "multer";
import { extensionForImageMime } from "./extensionForImageMime.js";
import { isMulterFileSizeError, isUnsupportedImageUploadError } from "./upload-error-guards.js";

const maxBytes = 5 * 1024 * 1024;

/** Multer middleware: single field `file`, JPEG/PNG/Webp only, max 5 MiB. */
export function createImageUploadSingle(uploadDir: string): RequestHandler {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = extensionForImageMime(file.mimetype);
      cb(null, `${randomUUID()}${ext ?? ".jpg"}`);
    },
  });

  const inner = multer({
    storage,
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      if (extensionForImageMime(file.mimetype) === null) {
        cb(new Error("UNSUPPORTED_IMAGE_TYPE"));
        return;
      }
      cb(null, true);
    },
  }).single("file");

  return (req: Request, res: Response, next: NextFunction): void => {
    inner(req, res, (err: unknown) => {
      if (err == null) {
        next();
        return;
      }
      if (isMulterFileSizeError(err)) {
        res.status(400).json({
          success: false,
          error: { code: "FILE_TOO_LARGE", message: "Image must be at most 5 MiB" },
        });
        return;
      }
      if (isUnsupportedImageUploadError(err)) {
        res.status(400).json({
          success: false,
          error: {
            code: "UNSUPPORTED_IMAGE_TYPE",
            message: "Only JPEG, PNG, and WebP images are allowed",
          },
        });
        return;
      }
      next(err);
    });
  };
}
