#!/usr/bin/env bash
# ============================================================================
# tools/merge.sh  (v2 — hardened for AI-context review)
#
# MERGE MANY FILES → ONE ARTIFACT WITH CLEAR BOUNDARIES
#
# WHY THIS TOOL EXISTS:
#   Chat-based review loses context when pasting files individually.
#   A deterministic merge with clear boundary markers is diffable and safe.
#
# USAGE:
#   ./tools/merge.sh <phase-name> <file1> <file2> ...
#   ./tools/merge.sh <phase-name> --from-list <listfile>
#   ./tools/merge.sh <phase-name> --dir <directory> [--ext <ext1,ext2>]
#   ./tools/merge.sh --help
#
# OPTIONS:
#   --from-list <file>       Read paths from <file> (one per line, # = comment)
#   --dir <dir>              Recursively include matching files under <dir>
#   --ext <exts>             Extensions for --dir mode (default: .js,.jsx)
#   --exclude <glob>         Repeatable. Exclude paths matching glob (case-insens.)
#   --max-lines <n>          Warn (or hard-fail with --strict) if > n lines
#   --strict                 With --max-lines, hard-fail instead of warn
#   --manifest               Also write <phase>_MANIFEST.txt (file list + line counts)
#   --no-manifest            (default)
#   --dry-run                Show what WOULD be merged; produce no file
#   --allow-protected        Allow files matching the deny-list
#   --allow-binary           Allow files with binary content
#   --out <file>             Override the output filename
#   --help                   Show this help
#
# EXIT CODES:
#   0 = success (with or without warnings)
#   1 = usage error
#   2 = --max-lines exceeded with --strict
#
# SAFETY:
#   - Refuses .env*, node_modules/, .next/, dist/, build/, .git/, lockfiles
#   - Skips binary-looking files
#   - Warns about missing files
#   - Warns if the output would be huge (> 100K lines or > 5 MB)
# ============================================================================

set -uo pipefail

# ----- Colors (only if TTY) -----
if [ -t 1 ]; then
  C_RED=$'\033[0;31m'; C_GRN=$'\033[0;32m'; C_YLW=$'\033[0;33m'
  C_BLU=$'\033[0;34m'; C_DIM=$'\033[2m';   C_RST=$'\033[0m'
else
  C_RED=""; C_GRN=""; C_YLW=""; C_BLU=""; C_DIM=""; C_RST=""
fi

DENY_PATTERNS=(
  '(^|/)\.env(\.|$)'
  '(^|/)node_modules/'
  '(^|/)\.next/'
  '(^|/)dist/'
  '(^|/)build/'
  '(^|/)\.git/'
  '(^|/)package-lock\.json$'
  '(^|/)pnpm-lock\.yaml$'
  '(^|/)yarn\.lock$'
  '(^|/)\.DS_Store$'
)

print_usage() {
  sed -n '9,40p' "$0" | sed 's/^# \{0,1\}//'
}

# ----- Arg parsing -----
PHASE_NAME=""
FROM_LIST=""
DIR=""
EXTS=".js,.jsx"
OUTPUT_OVERRIDE=""
ALLOW_PROTECTED=0
ALLOW_BINARY=0
DO_MANIFEST=0
DRY_RUN=0
STRICT=0
MAX_LINES=0
EXCLUDES=()
FILE_ARGS=()

die() { echo -e "${C_RED}❌ $*${C_RST}" >&2; exit 1; }
warn() { echo -e "${C_YLW}⚠️  $*${C_RST}" >&2; }
ok()   { echo -e "${C_GRN}✅ $*${C_RST}"; }

need_val() { [ $# -ge 2 ] && [ -n "$2" ] || die "$1 requires a value"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --help|-h) print_usage; exit 0 ;;
    --from-list)  need_val "$1" "${2:-}"; FROM_LIST="$2"; shift 2 ;;
    --dir)        need_val "$1" "${2:-}"; DIR="$2"; shift 2 ;;
    --ext)        need_val "$1" "${2:-}"; EXTS="$2"; shift 2 ;;
    --exclude)    need_val "$1" "${2:-}"; EXCLUDES+=("$2"); shift 2 ;;
    --max-lines)  need_val "$1" "${2:-}"; MAX_LINES="$2"; shift 2 ;;
    --out)        need_val "$1" "${2:-}"; OUTPUT_OVERRIDE="$2"; shift 2 ;;
    --allow-protected) ALLOW_PROTECTED=1; shift ;;
    --allow-binary)    ALLOW_BINARY=1; shift ;;
    --manifest)   DO_MANIFEST=1; shift ;;
    --no-manifest) DO_MANIFEST=0; shift ;;
    --dry-run)    DRY_RUN=1; shift ;;
    --strict)     STRICT=1; shift ;;
    --*) die "Unknown option: $1" ;;
    *)
      if [ -z "$PHASE_NAME" ]; then PHASE_NAME="$1"; else FILE_ARGS+=("$1"); fi
      shift ;;
  esac
done

[ -z "$PHASE_NAME" ] && die "Missing <phase-name>. Try --help."

# ----- Load from --from-list (CRLF-safe, comment-safe) -----
if [ -n "$FROM_LIST" ]; then
  [ -f "$FROM_LIST" ] || die "List file not found: $FROM_LIST"
  while IFS= read -r line || [ -n "$line" ]; do
    # Strip CRLF
    line="${line%$'\r'}"
    # Trim leading/trailing whitespace
    line="$(printf '%s' "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    [ -z "$line" ] && continue
    case "$line" in \#*) continue ;; esac
    FILE_ARGS+=("$line")
  done < "$FROM_LIST"
fi

# ----- Load from --dir (find excludes inline for speed) -----
if [ -n "$DIR" ]; then
  [ -d "$DIR" ] || die "Directory not found: $DIR"
  IFS=',' read -ra EXT_LIST <<< "$EXTS"
  FIND_NAME_ARGS=()
  for e in "${EXT_LIST[@]}"; do
    [ -z "$e" ] && continue
    case "$e" in .*) ;; *) e=".$e" ;; esac
    [ ${#FIND_NAME_ARGS[@]} -gt 0 ] && FIND_NAME_ARGS+=("-o")
    FIND_NAME_ARGS+=("-name" "*${e}")
  done

  FIND_EXCLUDE_ARGS=()
  for pat in "${DENY_PATTERNS[@]}"; do
    # Convert our grep-style pattern to a find -path glob as best we can
    # (find uses shell globs, not regex; we approximate the common cases)
    FIND_EXCLUDE_ARGS+=("-o" "-path" "*/node_modules/*" \
                         "-o" "-path" "*/.next/*" \
                         "-o" "-path" "*/dist/*" \
                         "-o" "-path" "*/build/*" \
                         "-o" "-path" "*/.git/*")
    break
  done
  # Also honor user --exclude globs
  for pat in "${EXCLUDES[@]:-}"; do
    [ -z "$pat" ] && continue
    FIND_EXCLUDE_ARGS+=("-o" "-path" "$pat")
  done

  while IFS= read -r path; do
    FILE_ARGS+=("$path")
  done < <(
    find "$DIR" -type f \
      \( "${FIND_NAME_ARGS[@]}" \) \
      ! \( "${FIND_EXCLUDE_ARGS[@]}" \) \
      ! -name '.env' ! -name '.env.*' \
      ! -name 'package-lock.json' ! -name 'yarn.lock' ! -name 'pnpm-lock.yaml' \
      2>/dev/null | sort
  )
fi

TOTAL=${#FILE_ARGS[@]}
[ "$TOTAL" -eq 0 ] && die "No files to merge. Provide file paths, --from-list, or --dir."

OUTPUT="${OUTPUT_OVERRIDE:-${PHASE_NAME}_files.txt}"
MANIFEST_OUT="${PHASE_NAME}_MANIFEST.txt"

# ----- Helpers -----
is_denied() {
  local path="$1" pattern
  [ "$ALLOW_PROTECTED" -eq 1 ] && return 1
  for pattern in "${DENY_PATTERNS[@]}"; do
    printf '%s' "$path" | grep -Eq "$pattern" && return 0
  done
  return 1
}

is_excluded() {
  local path="$1" pat
  for pat in "${EXCLUDES[@]:-}"; do
    [ -z "$pat" ] && continue
    # shellcheck disable=SC2053
    case "$path" in $pat) return 0 ;; esac
  done
  return 1
}

is_binary() {
  local path="$1"
  [ "$ALLOW_BINARY" -eq 1 ] && return 1
  if command -v file >/dev/null 2>&1; then
    file --brief --mime-encoding "$path" 2>/dev/null | grep -q '^binary$' && return 0
  fi
  if command -v od >/dev/null 2>&1; then
    od -An -N 8000 -c "$path" 2>/dev/null | grep -q '\\0' && return 0
  fi
  return 1
}

# ----- Dry-run: just show what would be included -----
if [ "$DRY_RUN" -eq 1 ]; then
  echo -e "${C_BLU}DRY RUN — would merge $TOTAL file(s) → $OUTPUT${C_RST}"
  echo "============================================================"
  i=0
  for f in "${FILE_ARGS[@]}"; do
    i=$((i+1))
    if is_denied "$f"; then
      printf '%s[%d] %s  (PROTECTED — will skip)%s\n' "$C_YLW" "$i" "$f" "$C_RST"
    elif is_excluded "$f"; then
      printf '%s[%d] %s  (EXCLUDED — will skip)%s\n' "$C_YLW" "$i" "$f" "$C_RST"
    elif [ ! -f "$f" ]; then
      printf '%s[%d] %s  (MISSING)%s\n' "$C_RED" "$i" "$f" "$C_RST"
    elif is_binary "$f"; then
      printf '%s[%d] %s  (BINARY — will skip)%s\n' "$C_YLW" "$i" "$f" "$C_RST"
    else
      lines=$(wc -l < "$f" | tr -d ' ')
      printf '%s[%d]%s %s  (%s lines)\n' "$C_GRN" "$i" "$C_RST" "$f" "$lines"
    fi
  done
  echo "============================================================"
  exit 0
fi

# ----- Main merge -----
INDEX=0
MISSING_COUNT=0
SKIPPED_COUNT=0
INCLUDED_COUNT=0
TOTAL_LINES=0
MISSING_LIST=""
SKIPPED_LIST=""
MANIFEST_BODY=""

{
  echo "#################################################################################"
  echo "# MERGED FILES FOR: $PHASE_NAME"
  echo "# Generated: $(date)"
  echo "# Repository root: $(pwd)"
  echo "# Files requested: $TOTAL"
  echo "#"
  echo "# MANIFEST:"
  i=0
  for f in "${FILE_ARGS[@]}"; do
    i=$((i+1))
    printf '#   [%d] %s\n' "$i" "$f"
  done
  echo "#################################################################################"

  for file in "${FILE_ARGS[@]}"; do
    INDEX=$((INDEX + 1))
    echo ""
    echo "================================================================================"

    if is_denied "$file"; then
      echo ">>> FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
      echo "[SKIPPED — matches protected pattern; pass --allow-protected to override]"
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file (SKIPPED)"
      echo "================================================================================"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      SKIPPED_LIST="${SKIPPED_LIST}"$'\n'"#   - $file (protected)"
      continue
    fi

    if is_excluded "$file"; then
      echo ">>> FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
      echo "[SKIPPED — matches --exclude pattern]"
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file (SKIPPED)"
      echo "================================================================================"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      SKIPPED_LIST="${SKIPPED_LIST}"$'\n'"#   - $file (excluded)"
      continue
    fi

    if [ ! -f "$file" ]; then
      echo ">>> FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
      echo "[MISSING FILE]"
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file (MISSING)"
      echo "================================================================================"
      MISSING_COUNT=$((MISSING_COUNT + 1))
      MISSING_LIST="${MISSING_LIST}"$'\n'"#   - $file"
      continue
    fi

    if is_binary "$file"; then
      echo ">>> FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
      echo "[SKIPPED — binary file; pass --allow-binary to override]"
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file (SKIPPED)"
      echo "================================================================================"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      SKIPPED_LIST="${SKIPPED_LIST}"$'\n'"#   - $file (binary)"
      continue
    fi

    # Included — count lines and cat
    local_lines=$(wc -l < "$file" | tr -d ' ')
    TOTAL_LINES=$((TOTAL_LINES + local_lines))
    INCLUDED_COUNT=$((INCLUDED_COUNT + 1))
    MANIFEST_BODY="${MANIFEST_BODY}"$'\n'"$file"$'\t'"$local_lines"

    echo ">>> FILE [$INDEX/$TOTAL]: $file ($local_lines lines)"
    echo "================================================================================"
    echo ""
    cat "$file"
    echo ""
    echo "================================================================================"
    echo "<<< END FILE [$INDEX/$TOTAL]: $file"
    echo "================================================================================"
  done

  echo ""
  echo "#################################################################################"
  echo "# SUMMARY"
  echo "#   Requested : $TOTAL"
  echo "#   Included  : $INCLUDED_COUNT"
  echo "#   Missing   : $MISSING_COUNT"
  echo "#   Skipped   : $SKIPPED_COUNT"
  echo "#   Total line count (included files only): $TOTAL_LINES"
  if [ "$MISSING_COUNT" -gt 0 ]; then
    echo "#"
    echo "# MISSING FILES:"
    printf '%s\n' "$MISSING_LIST"
  else
    echo "# MISSING FILES: none"
  fi
  if [ "$SKIPPED_COUNT" -gt 0 ]; then
    echo "#"
    echo "# SKIPPED FILES:"
    printf '%s\n' "$SKIPPED_LIST"
  else
    echo "# SKIPPED FILES: none"
  fi
  echo "#################################################################################"
} > "$OUTPUT"

OUTPUT_LINES=$(wc -l < "$OUTPUT" | tr -d ' ')
OUTPUT_BYTES=$(wc -c < "$OUTPUT" | tr -d ' ')
OUTPUT_KB=$((OUTPUT_BYTES / 1024))

ok "Created $OUTPUT ($OUTPUT_LINES lines, ${OUTPUT_KB} KB)"
echo -e "${C_DIM}   Included: $INCLUDED_COUNT / $TOTAL   |   Missing: $MISSING_COUNT   |   Skipped: $SKIPPED_COUNT   |   Content lines: $TOTAL_LINES${C_RST}"

# Optional manifest file
if [ "$DO_MANIFEST" -eq 1 ]; then
  {
    echo "# MANIFEST: $PHASE_NAME"
    echo "# Generated: $(date)"
    echo "# Format: <path><TAB><line-count>"
    echo "# ----"
    printf '%s\n' "$MANIFEST_BODY" | sed '/^$/d'
  } > "$MANIFEST_OUT"
  ok "Manifest: $MANIFEST_OUT"
fi

# Warnings
if [ "$MISSING_COUNT" -gt 0 ]; then
  warn "$MISSING_COUNT file(s) were missing. See $OUTPUT."
fi
if [ "$SKIPPED_COUNT" -gt 0 ]; then
  warn "$SKIPPED_COUNT file(s) were skipped. See $OUTPUT."
fi

if [ "$MAX_LINES" -gt 0 ] && [ "$OUTPUT_LINES" -gt "$MAX_LINES" ]; then
  if [ "$STRICT" -eq 1 ]; then
    die "Output exceeds --max-lines ($MAX_LINES). Got $OUTPUT_LINES lines."
  else
    warn "Output exceeds --max-lines ($MAX_LINES). Got $OUTPUT_LINES lines."
  fi
fi

# AI-context sanity warnings
if [ "$OUTPUT_LINES" -gt 100000 ]; then
  warn "Output is > 100K lines — may exceed AI context windows. Consider splitting into phases."
fi
if [ "$OUTPUT_KB" -gt 5120 ]; then
  warn "Output is > 5 MB — very likely too large for one chat send."
fi

exit 0