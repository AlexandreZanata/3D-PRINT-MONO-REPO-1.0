import type { ProductDTO, ProductFacade } from "@repo/application";
import type { AppLogger } from "@repo/utils";
import { NotFoundError, err, ok } from "@repo/utils";
import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { AuditService } from "../services/AuditService.js";
import { AdminProductController } from "./AdminProductController.js";

function sampleProduct(over: Partial<ProductDTO> = {}): ProductDTO {
  const now = new Date().toISOString();
  return {
    id: "id-1",
    name: "Vase",
    slug: "vase",
    tagline: "",
    category: "Decor",
    material: "",
    dimensions: "",
    description: "Desc",
    price: 10,
    stock: 2,
    whatsappNumber: "+5511999999999",
    imageUrl: "/api/v1/uploads/x.jpg",
    images: [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...over,
  };
}

describe("AdminProductController.getById", () => {
  it("responds 200 with product data", async () => {
    const dto = sampleProduct();
    const getById = vi.fn().mockResolvedValue(ok(dto));
    // Test double: controller only calls getById on the facade.
    const facade = { getById } as unknown as ProductFacade;
    const audit = { log: vi.fn() } as unknown as AuditService;
    const logger = {
      child: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as AppLogger;
    const ctrl = new AdminProductController(facade, audit, logger);

    // Test double: controller only reads `params.id`.
    const req = { params: { id: "id-1" } } as unknown as Request;
    const json = vi.fn();
    const res = { status: vi.fn().mockReturnThis(), json } as unknown as Response;
    const next = vi.fn();

    await ctrl.getById(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith({ success: true, data: dto });
  });

  it("calls next when product is missing", async () => {
    const getById = vi.fn().mockResolvedValue(err(new NotFoundError("missing", "NOT_FOUND")));
    const facade = { getById } as unknown as ProductFacade;
    const audit = { log: vi.fn() } as unknown as AuditService;
    const logger = {
      child: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as AppLogger;
    const ctrl = new AdminProductController(facade, audit, logger);

    const req = { params: { id: "missing" } } as unknown as Request;
    const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    await ctrl.getById(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 when id param is missing", async () => {
    const getById = vi.fn();
    const facade = { getById } as unknown as ProductFacade;
    const audit = { log: vi.fn() } as unknown as AuditService;
    const logger = {
      child: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as AppLogger;
    const ctrl = new AdminProductController(facade, audit, logger);

    const req = { params: {} } as unknown as Request;
    const json = vi.fn();
    const res = { status: vi.fn().mockReturnThis(), json } as unknown as Response;
    const next = vi.fn();

    await ctrl.getById(req, res, next);

    expect(getById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(json.mock.calls[0]?.[0]).toMatchObject({ success: false });
  });
});
