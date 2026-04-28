import { describe, it, expect } from "vitest";
import { toAuditLog, toAuditLogList } from "./AdminFacade";
import type { ApiAuditLog } from "./AdminFacade";

const makeApiAuditLog = (overrides: Partial<ApiAuditLog> = {}): ApiAuditLog => ({
  id: "log-1",
  adminId: "admin-1",
  action: "create",
  entity: "product",
  entityId: "prod-1",
  payload: { name: "Vase" },
  ip: "127.0.0.1",
  ua: "Mozilla/5.0",
  createdAt: "2026-04-28T00:00:00.000Z",
  ...overrides,
});

describe("toAuditLog", () => {
  it("should map a raw API audit log to a frontend AuditLog", () => {
    const result = toAuditLog(makeApiAuditLog());
    expect(result.id).toBe("log-1");
    expect(result.action).toBe("create");
    expect(result.entity).toBe("product");
    expect(result.payload).toEqual({ name: "Vase" });
  });

  it("should preserve all fields including ip and ua", () => {
    const result = toAuditLog(makeApiAuditLog({ ip: "192.168.1.1", ua: "curl/7.0" }));
    expect(result.ip).toBe("192.168.1.1");
    expect(result.ua).toBe("curl/7.0");
  });

  it("should handle empty payload", () => {
    const result = toAuditLog(makeApiAuditLog({ payload: {} }));
    expect(result.payload).toEqual({});
  });
});

describe("toAuditLogList", () => {
  it("should map an array of audit logs with pagination meta", () => {
    const result = toAuditLogList(
      [makeApiAuditLog(), makeApiAuditLog({ id: "log-2", action: "delete" })],
      { page: 1, limit: 20, total: 2 },
    );
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.items[1]?.action).toBe("delete");
  });

  it("should return empty list when input is empty", () => {
    const result = toAuditLogList([], { page: 1, limit: 20, total: 0 });
    expect(result.items).toHaveLength(0);
  });
});
