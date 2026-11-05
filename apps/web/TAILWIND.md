
**************************************************************
**************************************************************

# Tailwind CSS — Engineering Handbook

> **Status:** Active. Tailwind is installed and ready for new UI work.
> Legacy components continue to use the pure-CSS design system and are
> **not required to migrate**.

---

## TL;DR

- **New components**: write them with Tailwind utilities.
- **Existing components**: leave them alone unless you're already editing them.
- **Design tokens**: live in `styles/themes.css`. Edit there — never in `tailwind.config.js`.
- **Preflight is disabled**: your CSS reset in `globals.css` is the only reset.
- **No class prefix**: use standard Tailwind utilities (`flex`, `p-4`, `text-gold-500`).

---

## The Unified Design System

The platform has **one** design system. Tailwind and pure CSS both read the
same CSS variables from `styles/themes.css`.

```
┌──────────────────────────┐
│  styles/themes.css       │  ← single source of truth
│  --accent-gold: #f59e0b  │
│  --bg-main: #070b14      │
│  --text-main: #f8fafc    │
│  ...                     │
└────────────┬─────────────┘
             │
   ┌─────────┴──────────┐
   │                    │
   ▼                    ▼
┌───────────┐    ┌─────────────────┐
│ Pure CSS  │    │ tailwind.config │
│ .glass-card    │ colors.gold     │
│ .btn-primary   │ = var(--accent-gold)
└───────────┘    └─────────────────┘
```

**Result:** change `--accent-gold` once → both systems update. Dark/light
theme switching works automatically in both. Zero duplicated tokens.

---

## How To Use

### New component (Tailwind)

```jsx
export default function StatusPill({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-bg-badge border border-border-badge text-success">
      {status}
    </span>
  );
}
```

### Legacy component (pure CSS) — untouched

```jsx
<div className="glass-card p-6">
  <h3 className="text-caption">Phase 3</h3>
</div>
```

Both render with the same visual language because they share tokens.

---

## Token Reference

All tokens are declared in `styles/themes.css`. When writing Tailwind,
prefix them with the appropriate utility. Common examples:

| CSS variable         | Tailwind class                                    |
|----------------------|---------------------------------------------------|
| `--bg-main`          | `bg-bg-main`                                      |
| `--bg-card`          | `bg-bg-card`                                      |
| `--text-main`        | `text-text-main`                                  |
| `--text-muted`       | `text-text-muted`                                 |
| `--accent-gold`      | `text-accent`, `bg-accent`, `border-accent`       |
| `--gold-500`         | `text-gold-500`, `bg-gold-500`                    |
| `--color-success`    | `text-success`, `bg-success`                      |
| `--border-main`      | `border-border-main`                              |
| `--shadow-lg`        | `shadow-lg`                                       |
| `--glass-blur`       | `backdrop-blur-glass`                             |
| `--font-primary`     | `font-sans`                                       |
| `--font-mono`        | `font-mono`                                       |

**Rule of thumb:** if it exists in `themes.css`, it exists in Tailwind.

---

## Adding a New Token

1. Add the variable to `styles/themes.css` **in both** `:root` and `.light-theme`.
2. Expose it in `tailwind.config.js` under `theme.extend` in the matching
   category (`colors`, `boxShadow`, etc.).
3. That's it. Both systems now have access to the new token.

**Never** hardcode a color, radius, or shadow in a component. If a design
value isn't in the token system yet, add it to `themes.css` first.

---

## Migrating a Component to Tailwind

Optional. Do it only when:

- You're already editing that component for another reason
- The component has grown difficult to maintain in pure CSS
- You want to add new functionality that would benefit from utilities

**Migration checklist:**

1. Replace component classes with Tailwind utilities
2. Verify dark + light theme both look correct
3. Verify mobile, tablet, desktop breakpoints
4. Delete the old CSS from `styles/components.css` (search by class name)
5. If the class is used elsewhere, leave it — Tailwind can coexist

---

## Preflight Is Disabled

`corePlugins.preflight = false` in `tailwind.config.js`.

**What this means:** Tailwind will **not** reset your HTML. The reset in
`globals.css` remains the only reset. This is intentional — the platform
already has a mature reset, and running two would cause visual regressions.

**What still works:** every Tailwind utility, component, and custom class.
You just don't get Tailwind's opinionated base styles. That's fine because
your base styles are already opinionated and battle-tested.

---

## Common Pitfalls

### ❌ Hardcoding a color
```jsx
<div className="bg-[#f59e0b]">  {/* NO */}
```
```jsx
<div className="bg-accent">     {/* YES */}
```

### ❌ Using Preflight-dependent utilities
```jsx
<img className="block w-full" />   {/* fine */}
<img className="w-full" />         {/* `img` display:inline is intentional — no reset */}
```

### ❌ Adding Tailwind's `@tailwind base`
Only `@tailwind components` and `@tailwind utilities` are used. Adding
`@tailwind base` would re-enable Preflight at the CSS level and break the
reset. **Don't**.

### ❌ Forgetting safelist for dynamic classes
```jsx
<div className={`grid-cols-${cols}`}>  {/* compiled away — not detected */}
```
Add to `safelist` in `tailwind.config.js`:
```javascript
{ pattern: /^grid-cols-(1|2|3|4|5|6|12)$/ },
```

---

## Build Verification

After any Tailwind change, run:

```bash
cd apps/web && npm run build
```

Confirm:

- ✅ Build compiles with zero Tailwind warnings
- ✅ `_next/static/css/*.css` grows only by the classes you actually used
- ✅ Dark + light mode visual parity on the touched screens

---

## Enforcement

- **PR review:** flag any hardcoded color, radius, or shadow
- **CI:** run `npm run build` — Tailwind emits warnings for empty content
- **Coding standards:** every styled value must be a token

The design system is a contract. Keep it clean.
```

---

## 🎯 Deployment Sequence

```bash
# 1. Save all 4 files above

# 2. Build — should compile clean with no Tailwind warnings
cd apps/web && npm run build

# 3. If clean, return and commit
cd ../..
git add apps/web/tailwind.config.js \
        apps/web/styles/tailwind.css \
        apps/web/styles/globals.css \
        apps/web/TAILWIND.md
git commit -m "feat(tailwind): unified design system bridging Tailwind utilities to CSS variable tokens

- Configure tailwind.config.js as a bridge between Tailwind utilities
  and the existing themes.css design tokens. Every color, radius, shadow,
  font, and animation resolves through CSS variables, guaranteeing that
  dark/light theme switching and token edits apply to both systems at once.
- Disable Preflight so the platform's existing reset in globals.css
  remains the sole source of element-level styling.
- Scan all JSX/TSX source files (industry standard) — Tailwind only
  emits classes that appear in code, so no style leakage is possible.
- Add safelist patterns for dynamically constructed class names used in
  admin dashboards and layout components.
- Introduce styles/tailwind.css exposing the components and utilities
  layers while intentionally omitting @tailwind base.
- Import tailwind.css as the final entry in globals.css so atomic
  utilities win the cascade when developers explicitly apply them.
- Add TAILWIND.md as the engineering handbook covering token usage,
  migration policy, Preflight rationale, and enforcement rules.

Zero hardcoded design values. One source of truth. Industry-standard
configuration." && \
git push origin main
```

---

## 🧪 Sanity Test After Deploy

Create a throwaway test file anywhere (e.g. `apps/web/pages/tailwind-sandbox.jsx`):

```jsx
export default function TailwindSandbox() {
  return (
    <div className="min-h-screen bg-bg-main text-text-main p-8">
      <h1 className="text-3xl font-bold text-gold-500 mb-4">Tailwind Works</h1>
      <p className="text-text-muted mb-6">
        Toggle the theme — this text and background flip instantly.
      </p>
      <div className="bg-bg-card border border-border-main rounded-2xl p-6 shadow-lg">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-bg-badge border border-border-badge text-success">
          Live
        </span>
      </div>
    </div>
  );
}
```

Open `/tailwind-sandbox`:

- ✅ Dark background by default
- ✅ Gold heading
- ✅ Card looks like a `glass-card`
- ✅ Toggle to light → **everything flips**
- ✅ No console warnings

Delete the file after verification.

---

**Files delivered: 4 — 2 new (`tailwind.css`, `TAILWIND.md`), 2 rewritten (`tailwind.config.js`, `globals.css`). Industry-standard. Zero hardcoded values. One unified design system.** 🔥


---

## 🛡️ Migration Guardrails

The rest of this document explains *what* the design system is. This section explains *how to migrate to it safely* — the process that prevents the "one bad commit breaks the whole theme" failure mode.

### The Golden Rule

> **Never migrate more than one file per commit.**

A migration commit changes the rendered HTML of every page that imports the migrated file. If it's wrong, you want a single, isolated revert point — not a 20-file PR you have to untangle.

### The 5-Step Workflow

Before each migration:

**Step 0 — Capture the "before" baseline**

```bash
# In one terminal:
npm run dev

# In another terminal:
./tools/snapshot-pages.sh before