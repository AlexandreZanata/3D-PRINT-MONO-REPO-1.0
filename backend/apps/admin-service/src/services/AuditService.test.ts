import type { IAuditLogRepository } from "@repo/domain";
import type { AppLogger } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { InfraError } from "@repo/utils";
import type { Request } from "express";
// @max-lines 200 — this is enforced by the lint pipeline.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditService } from "./AuditService.js";

function makeRepo(): IAuditLogRepository {
  return {
    save: vi.fn().mockResolvedValue(ok(undefined)),
    findAll: vi.fn(),
  };
}

function makeLogger(): AppLogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    trace: vi.fn(),
    child: vi.fn(),
  } as unknown as AppLogger;
}

function makeReq(ip = "127.0.0.1", ua = "test-agent"): Request {
  return {
    ip,
    headers: { "user-agent": ua },
  } as unknown as Request;
}

describe("AuditService", () => {
  let repo: ReturnType<typeof makeRepo>;
  let logger: AppLogger;
  let service: AuditService;

  beforeEach(() => {
    repo = makeRepo();
    logger = makeLogger();
    service = new AuditService(repo, logger);
  });

  describe("log", () => {
    it("should save an audit log record with correct fields", async () => {
      await service.log({
        adminId: "admin-1",
        action: "create",
        entity: "product",
        entityId: "prod-1",
        payload: { name: "Vase" },
        req: makeReq("192.168.1.1", "Mozilla/5.0"),
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: "admin-1",
          action: "create",
          entity: "product",
          entityId: "prod-1",
          payload: { name: "Vase" },
          ip: "192.168.1.1",
          ua: "Mozilla/5.0",
        }),
      );
    });

    it("should use 'unknown' for missing ip and user-agent", async () => {
      await service.log({
        adminId: "admin-2",
        action: "delete",
        entity: "product",
        entityId: "prod-2",
        payload: {},
        req: { ip: undefined, headers: {} } as unknown as Request,
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ ip: "unknown", ua: "unknown" }),
      );
    });

    it("should log a warning but not throw when repo.save fails", async () => {
      vi.mocked(repo.save).mockResolvedValue(
        err(new InfraError("DB error", new Error("conn"), "DB_ERROR")),
      );

      await expect(
        service.log({
          adminId: "admin-3",
          action: "update",
          entity: "product",
          entityId: "prod-3",
          payload: {},
          req: makeReq(),
        }),
      ).resolves.toBeUndefined();

      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
