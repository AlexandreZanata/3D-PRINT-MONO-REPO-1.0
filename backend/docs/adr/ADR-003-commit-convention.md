# ADR-003: Conventional Commits with Commitlint and Lefthook

## Status

Accepted

## Context

A monorepo with multiple apps and packages requires a disciplined commit history to:

- Generate accurate changelogs automatically (`@changesets/cli`).
- Make `git bisect` and `git log --oneline` useful across a large codebase.
- Enforce scope boundaries so reviewers immediately know which package a commit affects.
- Prevent "mega-commits" that touch many packages at once, which make code review
  harder and increase the blast radius of a bad merge.

Options considered:

1. **No convention** — free-form commit messages.
2. **Conventional Commits + commitlint** — machine-readable format, tooling support.
3. **Angular commit format** — similar to Conventional Commits but less widely adopted.

## Decision

Adopt **Conventional Commits v1.0** enforced by:

- `@commitlint/cli` + `@commitlint/config-conventional` for message format validation.
- A custom `scripts/check-commit-scope.sh` script for the "max 3 packages" rule.
- **Lefthook** for git hook management (replaces Husky).

### Commit format

```
<type>(<scope>): <subject>   ← max 72 chars

[body]                        ← max 100 chars per line, explains WHY

[footer]                      ← BREAKING CHANGE: ..., Closes #...
```

### Allowed types

| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | New feature visible to users or API consumers    |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation only                               |
| `style`    | Formatting, no logic change                      |
| `refactor` | Code restructure, no behavior change             |
| `test`     | Adding or fixing tests                           |
| `chore`    | Build, tooling, dependencies                     |
| `perf`     | Performance improvement                          |
| `ci`       | CI/CD pipeline changes                           |
| `revert`   | Reverts a previous commit                        |

### Allowed scopes

Scopes map 1-to-1 to workspace package/app names:

`api-gateway` | `product-service` | `admin-service` | `notification-service` |
`domain` | `application` | `contracts` | `db-adapter` | `cache-adapter` |
`queue-adapter` | `sse-adapter` | `utils` | `infra` | `docs` | `deps` | `release`

### Max-3-packages rule

No single commit may touch more than 3 workspace members (apps/* or packages/**)
at once. The only exception is `chore(deps):` commits, which typically update
lock files and manifests across the entire monorepo.

This rule is enforced by `scripts/check-commit-scope.sh`, called from the
`pre-commit` Lefthook hook.

### Breaking changes

Breaking changes must:
1. Include `!` after type+scope: `feat(api-gateway)!: rename /products to /catalog`.
2. Include a `BREAKING CHANGE:` footer explaining the migration path.

## Rationale

### Why Conventional Commits over free-form messages

Conventional Commits are machine-readable. `@changesets/cli` and standard changelog
tools parse them to produce accurate release notes without manual curation.

### Why Lefthook over Husky

Lefthook is a single binary with no Node.js runtime dependency at hook execution
time. It supports parallel hook execution, per-command `root` overrides (critical
for a monorepo where `.git` is not co-located with `package.json`), and has
first-class pnpm support. Husky v9 dropped the `prepare` auto-install pattern
that Lefthook still supports cleanly.

### Why a "max 3 packages" rule

Commits that span many packages are hard to review, hard to revert, and obscure
the change history of individual packages. Three is a pragmatic upper bound:
most features touch one app + one or two shared packages. Dependency updates
are exempted because they are mechanical and always touch the entire workspace.

### Why commitlint scope enforcement

Scopes are validated against an explicit allowlist. This prevents typos
(`api-gatway` instead of `api-gateway`) and ensures every commit is traceable
to a specific workspace member, which is essential for automated changelog
generation per package.

## Consequences

### Positive

- Changelogs generated automatically from commit history.
- Reviewers immediately see which package a commit affects from the scope.
- Breaking changes are surfaced in the commit subject, not buried in the body.
- The "max 3 packages" rule keeps commits focused and reviewable.
- Lefthook hooks are installed automatically on `pnpm install` via the
  `prepare` script, so new contributors get enforcement without manual setup.

### Negative

- Developers must learn the commit format (mitigated by commitlint error messages).
- The "max 3 packages" rule occasionally requires splitting a logical change
  into multiple commits (acceptable trade-off for reviewability).
- Lefthook must be installed at the git root, not inside `backend/`, because
  `.git` lives at the workspace root. The root `lefthook.yml` delegates to
  backend commands via the `root:` override.

## References

- [Conventional Commits v1.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [commitlint docs](https://commitlint.js.org/)
- [Lefthook docs](https://lefthook.dev/)
- [Section 14 of init.md](../init.md)
