// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { createLogger, withCorrelation } from "./logger.js";

describe("createLogger()", () => {
  it("should create a logger with the given service name", () => {
    const logger = createLogger("test-service");
    expect(logger.bindings()["name"]).toBe("test-service");
  });

  it("should default to 'info' log level when LOG_LEVEL is not set", () => {
    delete process.env["LOG_LEVEL"];
    const logger = createLogger("test-service");
    expect(logger.level).toBe("info");
  });

  it("should use LOG_LEVEL env var when set", () => {
    process.env["LOG_LEVEL"] = "debug";
    const logger = createLogger("test-service");
    expect(logger.level).toBe("debug");
    delete process.env["LOG_LEVEL"];
  });
});

describe("withCorrelation()", () => {
  it("should return a child logger with correlationId bound", () => {
    const logger = createLogger("test-service");
    const child = withCorrelation(logger, "corr-123");
    expect(child.bindings()["correlationId"]).toBe("corr-123");
  });

  it("should not mutate the parent logger", () => {
    const logger = createLogger("test-service");
    withCorrelation(logger, "corr-456");
    expect(logger.bindings()["correlationId"]).toBeUndefined();
  });
});
