// @max-lines 200 — this is enforced by the lint pipeline.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLogger, withCorrelation } from "./logger.js";

describe("createLogger()", () => {
  let originalLogLevel: string | undefined;

  beforeEach(() => {
    // Snapshot the env var before each test so we can restore it cleanly.
    originalLogLevel = process.env.LOG_LEVEL;
  });

  afterEach(() => {
    // Restore — avoids cross-test pollution.
    if (originalLogLevel === undefined) {
      // Reflect.deleteProperty avoids the lint/performance/noDelete rule
      // while correctly removing the key (assigning undefined would pass
      // the string "undefined" to Pino, which is not a valid log level).
      Reflect.deleteProperty(process.env, "LOG_LEVEL");
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });

  it("should create a logger with the given service name", () => {
    const logger = createLogger("test-service");
    expect(logger.bindings().name).toBe("test-service");
  });

  it("should default to 'info' log level when LOG_LEVEL is not set", () => {
    // Reflect.deleteProperty correctly removes the key without triggering
    // lint/performance/noDelete. Assigning undefined would pass the string
    // "undefined" to Pino, which throws "default level:undefined must be
    // included in custom levels".
    Reflect.deleteProperty(process.env, "LOG_LEVEL");
    const logger = createLogger("test-service");
    expect(logger.level).toBe("info");
  });

  it("should use LOG_LEVEL env var when set", () => {
    process.env.LOG_LEVEL = "debug";
    const logger = createLogger("test-service");
    expect(logger.level).toBe("debug");
  });
});

describe("withCorrelation()", () => {
  it("should return a child logger with correlationId bound", () => {
    const logger = createLogger("test-service");
    const child = withCorrelation(logger, "corr-123");
    expect(child.bindings().correlationId).toBe("corr-123");
  });

  it("should not mutate the parent logger", () => {
    const logger = createLogger("test-service");
    withCorrelation(logger, "corr-456");
    expect(logger.bindings().correlationId).toBeUndefined();
  });
});
