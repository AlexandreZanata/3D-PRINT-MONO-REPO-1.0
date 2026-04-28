#!/usr/bin/env bash
# @max-lines 200 — this is enforced by the lint pipeline.
#
# check-commit-scope.sh
#
# Enforces the Section 14 rule:
#   "No commit may contain changes to more than 3 packages/apps at once
#    (except chore(deps))."
#
# This script runs in the commit-msg hook (after the message is written),
# so $1 is always the path to the commit message file.
#
# Exemptions:
#   chore(deps)    — dependency updates touch the whole workspace by design
#   chore(infra)   — tooling/config changes that span the whole repo
#   fix(infra)     — cross-cutting tooling fixes (e.g. biome auto-fix)
#   style(*)       — formatting-only commits may touch many files
#   chore(release) — release commits update all changelogs

set -eo pipefail

MAX_MEMBERS=3
COMMIT_MSG_FILE="${1:-.git/COMMIT_EDITMSG}"

# ── 1. Read and check exemptions ─────────────────────────────────────────────
if [ ! -f "$COMMIT_MSG_FILE" ]; then
  exit 0
fi

first_line=$(head -n1 "$COMMIT_MSG_FILE" | tr -d '[:space:]')

if [ -n "$first_line" ]; then
  echo "$first_line" | grep -qE '^chore\(deps\)!?:'          && exit 0
  echo "$first_line" | grep -qE '^(chore|fix)\(infra\)!?:'   && exit 0
  echo "$first_line" | grep -qE '^style\([^)]+\)!?:'         && exit 0
  echo "$first_line" | grep -qE '^(chore|release)\(release\)!?:' && exit 0
fi

# ── 2. Collect staged files ───────────────────────────────────────────────────
# In commit-msg hook, the index still reflects what was staged.
staged_files=$(git diff --cached --name-only 2>/dev/null || true)

if [ -z "$staged_files" ]; then
  exit 0
fi

# ── 3. Extract distinct workspace members ────────────────────────────────────
extract_member() {
  local file="$1"
  local relative="${file#backend/}"

  if [[ "$relative" == apps/* ]]; then
    echo "$relative" | cut -d'/' -f2
  elif [[ "$relative" == packages/infra/* ]]; then
    echo "$relative" | cut -d'/' -f3
  elif [[ "$relative" == packages/* ]]; then
    echo "$relative" | cut -d'/' -f2
  fi
}

touched_list=""
while IFS= read -r file; do
  member=$(extract_member "$file")
  if [ -n "$member" ]; then
    touched_list="${touched_list}${member}"$'\n'
  fi
done <<< "$staged_files"

if [ -z "$touched_list" ]; then
  exit 0
fi

unique_members=$(echo "$touched_list" | sort -u | grep -v '^$')
member_count=$(echo "$unique_members" | wc -l | tr -d ' ')

# ── 4. Enforce the limit ─────────────────────────────────────────────────────
if [ "$member_count" -le "$MAX_MEMBERS" ]; then
  exit 0
fi

# ── 5. Fail with a descriptive message ───────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  COMMIT SCOPE VIOLATION (Section 14)                            ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
printf "║  This commit touches %d workspace members (max: %d).             ║\n" \
  "$member_count" "$MAX_MEMBERS"
echo "║                                                                  ║"
echo "║  Touched members:                                                ║"
while IFS= read -r m; do
  [ -z "$m" ] && continue
  printf "║    • %-60s║\n" "$m"
done <<< "$unique_members"
echo "║                                                                  ║"
echo "║  Split your changes into smaller, focused commits.              ║"
echo "║  Exemptions: chore(deps), chore(infra), fix(infra), style(*),   ║"
echo "║  chore(release).                                                 ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

exit 1
