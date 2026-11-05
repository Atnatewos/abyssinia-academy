#!/usr/bin/env bash
# ============================================================================
# tools/snapshot-pages.sh
#
# Visual regression baseline for Tailwind migration.
#
# Captures screenshots of every key page in BOTH themes (dark + light),
# saving them to test-results/snapshots/<timestamp>/. Then you migrate
# a component, run this again, and diff the two folders — any pixel
# change is visible side by side before you commit.
#
# WHY THIS EXISTS
# ───────────────
# Tailwind migration changes rendered HTML/CSS. Without a visual baseline,
# you can't tell whether a broken look is from your migration or from a
# pre-existing bug. This script gives you the "before" so you can prove
# the "after" is identical (or intentionally different).
#
# HOW IT WORKS
# ────────────
# Assumes the app is running at http://localhost:3000 (npm run dev).
# Uses Playwright, which is already a devDependency in this monorepo.
#
# USAGE
# ─────
#   # Terminal 1
#   npm run dev
#
#   # Terminal 2 — capture baseline BEFORE migration
#   ./tools/snapshot-pages.sh before
#
#   # ... migrate one component ...
#
#   # Capture AFTER migration
#   ./tools/snapshot-pages.sh after
#
#   # Diff two folders (Windows: use WinMerge / Beyond Compare; Mac/Linux: diff -r)
#   diff -r test-results/snapshots/<timestamp-before>/ test-results/snapshots/<timestamp-after>/
# ============================================================================

set -uo pipefail

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

LABEL="${1:-snapshot}"
BASE_URL="${2:-http://localhost:3000}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$REPO_ROOT/test-results/snapshots/${TIMESTAMP}_${LABEL}"

mkdir -p "$OUT_DIR"

echo ""
echo "${BLUE}Snapshot:${RESET} $LABEL"
echo "${BLUE}Base URL:${RESET} $BASE_URL"
echo "${BLUE}Output:  ${RESET} $OUT_DIR"
echo ""

# Verify the dev server is up before capturing anything.
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "^[23]"; then
  echo "${RED}Dev server is not responding at $BASE_URL${RESET}"
  echo "${DIM}Run 'npm run dev' in another terminal first.${RESET}"
  exit 1
fi

# Pages to snapshot. Add to this list as you build new pages.
PAGES=(
  "/"
  "/courses"
  "/courses/fullstack-web-engineering-masterclass"
  "/pricing"
  "/auth/login"
  "/auth/register"
  "/admin/login"
  "/admin"
  "/portal"
  "/profile"
  "/profile/referrals"
)

# Write a manifest so you know what was captured when.
MANIFEST="$OUT_DIR/manifest.txt"
{
  echo "Snapshot: $LABEL"
  echo "Timestamp: $TIMESTAMP"
  echo "Base URL: $BASE_URL"
  echo "Pages:"
  printf '  %s\n' "${PAGES[@]}"
} > "$MANIFEST"

# Playwright runs headless Chromium by default. We use a small inline
# script for portability — no test runner required, just `npx playwright`.
TMP_SCRIPT="$OUT_DIR/_capture.js"

cat > "$TMP_SCRIPT" <<'JSEOF'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [, , baseUrl, outDir, ...pages] = process.argv;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const route of pages) {
    const slug = route === '/' ? 'root' : route.replace(/^\//, '').replace(/\//g, '_');
    for (const theme of ['dark', 'light']) {
      try {
        // Set theme via localStorage before navigation — this is the
        // mechanism the app itself uses (see ThemeContext.js).
        await context.addInitScript((themeName) => {
          try { window.localStorage.setItem('theme', themeName); } catch {}
        }, theme);

        const url = `${baseUrl}${route}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // Give Framer Motion / fade-ins time to settle
        await page.waitForTimeout(800);

        const filename = `${slug}__${theme}.png`;
        await page.screenshot({
          path: path.join(outDir, filename),
          fullPage: true,
        });
        console.log(`  captured  ${filename}`);
      } catch (err) {
        console.error(`  FAILED    ${route} [${theme}]: ${err.message}`);
      }
    }
  }

  await browser.close();
})();
JSEOF

cd "$REPO_ROOT/apps/web" || exit 2

echo "${DIM}Capturing $((${#PAGES[@]} * 2)) screenshots (${#PAGES[@]} pages × 2 themes)...${RESET}"
echo ""

node "$TMP_SCRIPT" "$BASE_URL" "$OUT_DIR" "${PAGES[@]}"

# Clean up the temp script — the manifest and screenshots stay.
rm -f "$TMP_SCRIPT"

echo ""
echo "${GREEN}✅ Snapshots saved to:${RESET}"
echo "  ${DIM}$OUT_DIR${RESET}"
echo ""
echo "${BLUE}Next steps:${RESET}"
echo "  1. Migrate ONE component."
echo "  2. Re-run: ${DIM}./tools/snapshot-pages.sh after${RESET}"
echo "  3. Compare the two folders side by side."
echo "  4. If pixel-identical → commit. If changed → investigate."