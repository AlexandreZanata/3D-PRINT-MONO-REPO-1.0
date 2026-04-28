/**
 * Vitest + React Testing Library global setup.
 * Imported by vitest.config.ts via setupFiles.
 */
import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test to avoid state leakage
afterEach(() => server.resetHandlers());

// Stop server after all tests
afterAll(() => server.close());
