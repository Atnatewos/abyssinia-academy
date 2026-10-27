#!/bin/bash
# Production health check for abyssiniatech.vercel.app
# Usage: bash tools/production-health.sh

BASE="https://abyssiniatech.vercel.app"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local actual=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [[ "$actual" == $expected ]]; then
    echo "✅ $name → $actual"
    ((PASS++))
  else
    echo "❌ $name → $actual (expected: $expected)"
    ((FAIL++))
  fi
}

echo "═══════════════════════════════════════════════════════"
echo "  PRODUCTION HEALTH CHECK"
echo "  $BASE"
echo "═══════════════════════════════════════════════════════"

echo ""
echo "── Core pages ──"
check "Home" "$BASE/" "200"
check "Courses" "$BASE/courses" "200"
check "Pricing" "$BASE/pricing" "200"
check "Contact" "$BASE/contact" "200"
check "Auth login" "$BASE/auth/login" "200"
check "Auth register" "$BASE/auth/register" "200"

echo ""
echo "── Auth-guarded pages ──"
check "Profile" "$BASE/profile" "200"
check "Admin login" "$BASE/admin/login" "200"
check "Portal" "$BASE/portal" "200"

echo ""
echo "── Agent APIs (auth required, expect 401) ──"
check "Admin agents" "$BASE/api/admin/agents" "401"
check "Agent dashboard" "$BASE/api/agents/dashboard" "401"
check "Agent validate" "$BASE/api/agents/validate" "405"

echo ""
echo "── WIP pages (gitignored) ──"
check "Profile agents (should be 404)" "$BASE/profile/agents" "404"

echo ""
echo "── Static assets ──"
check "Logo" "$BASE/images/logo.svg" "200"
check "OG image" "$BASE/images/og-default.jpg" "200"

echo ""
echo "── Language data presence ──"
html=$(curl -s "$BASE/")
for lang in "English" "Afaan Oromoo" "ትግርኛ" "አማርኛ"; do
  if echo "$html" | grep -q "$lang"; then
    echo "✅ $lang found in HTML"
    ((PASS++))
  else
    echo "⚠️  $lang not in initial HTML (may need dropdown open)"
    # Not counted as FAIL — expected since labels render on demand
  fi
done

echo ""
echo "── Dropdown CSS class presence ──"
if echo "$html" | grep -q "language-dropdown"; then
  echo "✅ Language dropdown classes present"
  ((PASS++))
else
  echo "❌ Language dropdown classes NOT present"
  ((FAIL++))
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  RESULT: $PASS passed, $FAIL failed"
echo "═══════════════════════════════════════════════════════"

if [ $FAIL -eq 0 ]; then
  echo "🎉 All checks passed"
  exit 0
else
  echo "⚠️  $FAIL checks failed — review above"
  exit 1
fi