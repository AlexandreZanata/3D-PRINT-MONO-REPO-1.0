// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { WhatsAppNumberVO } from "./WhatsAppNumberVO.js";

describe("WhatsAppNumberVO.create()", () => {
  it("should accept a valid E.164 number with leading +", () => {
    const vo = WhatsAppNumberVO.create("+5511999999999");
    expect(vo.value).toBe("5511999999999");
  });

  it("should accept digits-only input", () => {
    const vo = WhatsAppNumberVO.create("5511999999999");
    expect(vo.value).toBe("5511999999999");
  });

  it("should throw for a number that is too short", () => {
    expect(() => WhatsAppNumberVO.create("123")).toThrow("7–15 digits");
  });

  it("should throw for a number that is too long", () => {
    expect(() => WhatsAppNumberVO.create("1234567890123456")).toThrow();
  });

  it("should throw for non-digit characters", () => {
    expect(() => WhatsAppNumberVO.create("+55 11 99999-9999")).toThrow();
  });

  it("should return E.164 format from toE164()", () => {
    const vo = WhatsAppNumberVO.create("+5511999999999");
    expect(vo.toE164()).toBe("+5511999999999");
  });

  it("should return true for equals() with same number", () => {
    const a = WhatsAppNumberVO.create("+5511999999999");
    const b = WhatsAppNumberVO.create("5511999999999");
    expect(a.equals(b)).toBe(true);
  });
});
