// @max-lines 200 — this is enforced by the lint pipeline.
import type { UserConfig } from "@commitlint/types";
// @commitlint/types is a peer of @commitlint/cli v20

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "revert",
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "api-gateway",
        "product-service",
        "admin-service",
        "notification-service",
        "domain",
        "application",
        "contracts",
        "db-adapter",
        "cache-adapter",
        "queue-adapter",
        "sse-adapter",
        "utils",
        "infra",
        "docs",
        "deps",
        "release",
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 100],
  },
};

export default config;
