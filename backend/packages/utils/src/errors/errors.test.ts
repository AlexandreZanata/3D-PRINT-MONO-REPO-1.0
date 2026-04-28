// @max-lines 200 — this is enforced by the lint pipeline.
import { describe, expect, it } from "vitest";
import { AppError } from "./AppError.js";
import { ConflictError } from "./ConflictError.js";
import { DomainError } from "./DomainError.js";
import { ForbiddenError } from "./ForbiddenError.js";
import { InfraError } from "./InfraError.js";
import { NotFoundError } from "./NotFoundError.js";
import { UnauthorizedError } from "./UnauthorizedError.js";

describe("DomainError", () => {
  it("should have httpStatus 400 and default code", () => {
    const e = new DomainError("invalid price");
    expect(e.httpStatus).toBe(400);
    expect(e.code).toBe("DOMAIN_ERROR");
    expect(e.message).toBe("invalid price");
    expect(e).toBeInstanceOf(AppError);
  });

  it("should accept a custom code", () => {
    const e = new DomainError("bad input", "INVALID_PRICE");
    expect(e.code).toBe("INVALID_PRICE");
  });
});

describe("NotFoundError", () => {
  it("should have httpStatus 404 and default code", () => {
    const e = new NotFoundError("product not found");
    expect(e.httpStatus).toBe(404);
    expect(e.code).toBe("NOT_FOUND");
  });
});

describe("UnauthorizedError", () => {
  it("should have httpStatus 401", () => {
    const e = new UnauthorizedError("missing token");
    expect(e.httpStatus).toBe(401);
    expect(e.code).toBe("UNAUTHORIZED");
  });
});

describe("ForbiddenError", () => {
  it("should have httpStatus 403", () => {
    const e = new ForbiddenError("admin only");
    expect(e.httpStatus).toBe(403);
    expect(e.code).toBe("FORBIDDEN");
  });
});

describe("ConflictError", () => {
  it("should have httpStatus 409", () => {
    const e = new ConflictError("email already exists");
    expect(e.httpStatus).toBe(409);
    expect(e.code).toBe("CONFLICT");
  });
});

describe("InfraError", () => {
  it("should have httpStatus 500 and expose the original cause", () => {
    const cause = new Error("connection refused");
    const e = new InfraError("db unreachable", cause);
    expect(e.httpStatus).toBe(500);
    expect(e.code).toBe("INFRA_ERROR");
    expect(e.cause).toBe(cause);
  });

  it("should accept a custom code", () => {
    const e = new InfraError("redis down", new Error("ECONNREFUSED"), "REDIS_ERROR");
    expect(e.code).toBe("REDIS_ERROR");
  });
});
