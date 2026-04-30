import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { UploadController } from "./UploadController.js";

function mockRes() {
  const state = { statusCode: 0, body: undefined as unknown };
  return {
    get statusCode() {
      return state.statusCode;
    },
    get body() {
      return state.body;
    },
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      state.body = payload;
    },
  };
}

describe("UploadController", () => {
  it("returns 201 with public URL when file is present", () => {
    const ctrl = new UploadController();
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    // Controller only reads `req.file`; narrow without full Express Request.
    const req = { file: { filename: "ab-cd.jpg" } } as unknown as Request;
    // Express Response is huge; this stub only implements status().json() used by the controller.
    ctrl.complete(req, res as unknown as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: { url: "/api/v1/uploads/ab-cd.jpg" },
    });
  });

  it("returns 400 when file is missing", () => {
    const ctrl = new UploadController();
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    const req = {} as unknown as Request;
    ctrl.complete(req, res as unknown as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: { code: "NO_FILE" } });
  });
});
