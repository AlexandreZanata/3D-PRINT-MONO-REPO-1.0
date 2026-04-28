import { describe, it, expect } from "vitest";
import { buildWhatsappUrl } from "./buildWhatsappUrl";

describe("buildWhatsappUrl", () => {
  it("should build a basic wa.me URL from a phone number", () => {
    expect(buildWhatsappUrl("+5511999999999")).toBe("https://wa.me/5511999999999");
  });

  it("should strip non-digit characters from the phone number", () => {
    expect(buildWhatsappUrl("+55 (11) 99999-9999")).toBe("https://wa.me/5511999999999");
  });

  it("should append encoded message when provided", () => {
    const url = buildWhatsappUrl("+5511999999999", "Hello world");
    expect(url).toBe("https://wa.me/5511999999999?text=Hello%20world");
  });

  it("should encode special characters in the message", () => {
    const url = buildWhatsappUrl("+5511999999999", "Price: $49.99 & more");
    expect(url).toContain("Price%3A%20%2449.99");
  });

  it("should return base URL when message is empty string", () => {
    const url = buildWhatsappUrl("+5511999999999", "");
    expect(url).toBe("https://wa.me/5511999999999");
  });
});
