import type { ApiSuccess } from "@repo/contracts";
import type { NextFunction, Request, Response } from "express";

type UploadResponse = { readonly url: string };

export class UploadController {
  /** After multer: responds with public path `/api/v1/uploads/{filename}`. */
  complete = (req: Request, res: Response, _next: NextFunction): void => {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: "NO_FILE", message: "Multipart field `file` is required" },
      });
      return;
    }

    const body: ApiSuccess<UploadResponse> = {
      success: true,
      data: { url: `/api/v1/uploads/${file.filename}` },
    };
    res.status(201).json(body);
  };
}
