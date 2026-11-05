#!/usr/bin/env bash
# ============================================================================
# tools/lint-file.sh
#
# Migration guard: verify a single component/page is fully migrated to
# design tokens before committing it.
#
# WHY THIS EXISTS
# ───────────────
# During gradual Tailwind migration, ESLint's `no-restricted-syntax` rules
# run at `warn` severity (see apps/web/.eslintrc.js) so they don't block
# the build. That means you can accidentally commit a file that still has
# raw palette colors — and you won't know until you deploy and users see
# a broken theme.
#
# This script is the missing gate. Point it at one file, it tells you
# instantly: clean (exit 0) or has violations (exit 1). Use it as your
# pre-commit check on every migrated file.
#
# USAGE
# ─────
#   ./tools/lint-file.sh apps/web/components/shared/Button.jsx
#   ./tools/lint-file.sh apps/web/components/shared/Button.jsx --verbose
#
# EXIT CODES
# ──────────
#   0 = file is migration-clean (zero no-restricted-syntax warnings)
#   1 = file still has violations (see printed list)
#   2 = usage error (missing file, file not found, etc.)
# ============================================================================

set -uo pipefail

# ----- ANSI colors (safe for non-TTY) -----
if [ -t 1 ]; then
  RED=$'\033[0;31m'
  GREEN=$'\033[0;32m'
  YELLOW=$'\033[0;33m'
  BLUE=$'\033[0;34m'
  DIM=$'\033[2m'
  RESET=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; DIM=""; RESET=""
fi

# ----- Argument parsing -----
FILE=""
VERBOSE=0

for arg in "$@"; do
  case "$arg" in
    --verbose|-v) VERBOSE=1 ;;
    --help|-h)
      sed -n '8,40p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    -*)
      echo "${RED}Unknown option: $arg${RESET}" >&2
      exit 2
      ;;
    *)
      if [ -z "$FILE" ]; then
        FILE="$arg"
      else
        echo "${RED}Only one file argument is supported.${RESET}" >&2
        exit 2
      fi
      ;;
  esac
done

if [ -z "$FILE" ]; then
  echo "${RED}Usage: $0 <file-path> [--verbose]${RESET}" >&2
  exit 2
fi

if [ ! -f "$FILE" ]; then
  echo "${RED}File not found: $FILE${RESET}" >&2
  exit 2
fi

# ----- Resolve repo root so the script works from any directory -----
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$REPO_ROOT/apps/web"

if [ ! -d "$WEB_DIR" ]; then
  echo "${RED}Cannot locate apps/web relative to script.${RESET}" >&2
  echo "${DIM}Expected: $WEB_DIR${RESET}" >&2
  exit 2
fi

# ----- Normalize the file path to be relative to apps/web -----
# The script should work whether the caller passes an absolute path,
# a path relative to the repo root, or a path relative to apps/web.
ABSOLUTE_FILE="$(cd "$(dirname "$FILE")" && pwd)/$(basename "$FILE")"
WEB_ABS="$(cd "$WEB_DIR" && pwd)"

case "$ABSOLUTE_FILE" in
  "$WEB_ABS"/*)
    RELATIVE_FILE="${ABSOLUTE_FILE#$WEB_ABS/}"
    ;;
  *)
    echo "${YELLOW}Warning: file is outside apps/web. Running ESLint anyway.${RESET}"
    RELATIVE_FILE="$FILE"
    ;;
esac

# ----- Run ESLint scoped to this one file -----
cd "$WEB_DIR" || exit 2

LINT_OUTPUT="$(npx eslint "$RELATIVE_FILE" 2>&1 || true)"

# ----- Parse the output -----
# Any line containing "no-restricted-syntax" is a violation we care about.
VIOLATION_LINES="$(echo "$LINT_OUTPUT" | grep -c "no-restricted-syntax" || true)"
VIOLATION_LINES="${VIOLATION_LINES:-0}"

# A file with only other warnings (no-unused-vars, etc.) is still
# considered migration-clean. Those are hygiene, not styling.
if [ "$VIOLATION_LINES" -eq 0 ]; then
  echo "${GREEN}✅ MIGRATION CLEAN${RESET}  ${DIM}$RELATIVE_FILE${RESET}"
  if [ "$VERBOSE" -eq 1 ] && [ -n "$LINT_OUTPUT" ]; then
    echo ""
    echo "${DIM}Other lint output (not migration blockers):${RESET}"
    echo "$LINT_OUTPUT"
  fi
  exit 0
fi

# ----- Non-clean: print the violations and fail -----
echo "${RED}❌ NOT READY TO COMMIT${RESET}  ${DIM}$RELATIVE_FILE${RESET}"
echo ""
echo "${YELLOW}Found $VIOLATION_LINES migration violation(s):${RESET}"
echo ""

# Print each violation line with its file:line:col and the message.
echo "$LINT_OUTPUT" | grep -B1 -A1 "no-restricted-syntax" | while IFS= read -r line; do
  # Highlight the location prefix and the message body separately
  if echo "$line" | grep -q "no-restricted-syntax"; then
    echo "  ${DIM}$line${RESET}"
  else
    echo "  $line"
  fi
done

echo ""
echo "${BLUE}How to fix:${RESET}"
echo "  ${DIM}See apps/web/TAILWIND.md → 'Migration Guardrails' for the token map.${RESET}"
echo ""
echo "${BLUE}Re-run this script after fixing:${RESET}"
echo "  ${DIM}./tools/lint-file.sh $FILE${RESET}"

exit 1