#!/usr/bin/env bash
# Detects internal navigation targets (Link href/to, router.push, config hrefs)
# that have no matching Next.js page file. Dynamic segments normalized to *.
set -u
cd "$(dirname "$0")/../apps/web" || exit 1

ROUTES=$(mktemp); LINKS=$(mktemp)
trap 'rm -f "$ROUTES" "$LINKS"' EXIT

# 1) Existing frontend routes (pages/** minus api/_app/_document); [param] -> *
find pages -type f \( -name '*.jsx' -o -name '*.js' \) \
    ! -path 'pages/api/*' ! -name '_app.*' ! -name '_document.*' \
  | sed 's|^pages||; s|\.\(js\|jsx\)$||; s|/index$||; s|^$|/|' \
  | sed -E 's/\[[^]]+\]/*/g' \
  | sort -u > "$ROUTES"

# 2) Internal link targets from JSX attributes, router.push, and config hrefs
{
  grep -rhoE '(href|to)=["`'"'"']/[^"`'"'"'?#]*' pages components --include='*.jsx' \
    | sed -E 's/^(href|to)=["`'"'"']//'
  grep -rhoE 'router\.push\((["`'"'"'])/[^)"`'"'"']*' pages components --include='*.jsx' \
    | sed -E 's/^router\.push\((["`'"'"'])//'
  grep -rhoE "href: ['\`]/[^'\`?#]*" pages components ../../packages/shared/config \
      --include='*.jsx' --include='*.js' \
    | sed -E "s/^href: ['\`]//"
} \
  | sed -E 's/\$\{[^}]*\}/*/g; s/[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}/*/g; s|/[0-9]+|/*|g; s|/$||; s|^$|/|' \
  | sort -u > "$LINKS"

echo "== EXISTING ROUTES ($(wc -l < "$ROUTES")) =="
cat "$ROUTES"
echo
echo "== BROKEN LINK TARGETS (no matching page file) =="
found=0
while IFS= read -r link; do
  case "$link" in '#'*|mailto:*|tel:*|http*|//*) continue ;; esac
  match=0
  while IFS= read -r route; do
    regex="^$(printf '%s' "$route" | sed -E 's/[][\.*^$()+?{}|]/\\&/g; s/\*/[^\/]+/g')$"
    if printf '%s' "$link" | grep -qE "$regex"; then match=1; break; fi
  done < "$ROUTES"
  if [ "$match" -eq 0 ]; then echo "  404 RISK: $link"; found=1; fi
done < "$LINKS"
[ "$found" -eq 0 ] && echo "  none - all internal links resolve."
