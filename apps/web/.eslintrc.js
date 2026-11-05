/**
 * @fileoverview ESLint Configuration — Design System Enforcement
 *
 * Purpose
 * ───────
 * This project ships a mature pure-CSS design system (themes.css +
 * design-system.css + components.css) AND Tailwind utilities on top of
 * it. Tailwind is being adopted gradually, one component at a time, per
 * the migration plan documented in apps/web/TAILWIND.md.
 *
 * The migration breaks down if developers accidentally introduce:
 *
 *   1. Raw Tailwind palette colors (bg-slate-900, text-amber-500, ...)
 *   2. `dark:` variant classes (bg-slate-100 dark:bg-slate-900)
 *   3. Raw hex/rgba values inside arbitrary-value classes
 *
 * See the selector comment blocks below for the "why" behind each.
 *
 * Enforcement Level — Migration In Progress
 * ─────────────────────────────────────────
 * The design-system rules are currently `warn` severity, not `error`.
 * This is a deliberate, time-boxed downgrade:
 *
 *   - The codebase has ~38 pre-existing violations in files that
 *     predate this ESLint config.
 *   - `next build` runs ESLint and blocks on `error`-level rules.
 *     Keeping the design-system rules at `error` today would fail
 *     every build until all 38 files are migrated.
 *   - Per the migration strategy (see TAILWIND.md → "Strict Rules"),
 *     styling debt is cleaned up one file at a time, on-touch, with
 *     proper testing — not in a large risky batch.
 *
 * The rules still fire at `warn` severity, so every violation appears
 * in `npm run lint` output. Nothing is hidden; only the build gate is
 * relaxed.
 *
 * WHEN TO FLIP BACK TO `error`
 * ────────────────────────────
 * Run `npm run lint 2>&1 | grep -c "no-restricted-syntax"`.
 * When the count reaches zero across the whole `apps/web` tree, change
 * all four selectors below from `'warn'` to `'error'`. At that point
 * the build gate becomes a real gate again, and future violations
 * are blocked before merge.
 *
 * React hooks rules remain at `error` severity — those are correctness
 * bugs, not styling debt, and must never be downgraded.
 *
 * Path: apps/web/.eslintrc.js
 */

'use strict';

module.exports = {
  /*
   * `root: true` stops ESLint from walking up into a parent monorepo
   * config. apps/web is its own workspace and owns its lint rules.
   */
  root: true,

  env: {
    browser: true,
    node: true,
    es2022: true,
  },

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  /*
   * Base ruleset from Next.js core-web-vitals. It covers the
   * Next.js-specific rules (no-img-element, no-html-link-for-pages,
   * etc.) plus the React hooks rules (rules-of-hooks,
   * exhaustive-deps) at their default severities.
   */
  extends: ['next/core-web-vitals'],

  rules: {
    /* ========================================================================
     * DESIGN SYSTEM ENFORCEMENT (migration in progress — see file header)
     *
     * One rule with multiple selectors. Each selector targets a specific
     * anti-pattern in string literals. The messages explain WHY, not just
     * WHAT — the goal is to teach the correct pattern on the first encounter.
     * ===================================================================== */
    'no-restricted-syntax': [
      'warn',

      /* ─────────────────────────────────────────────────────────────────────
       * BLOCK: Raw Tailwind palette colors
       *
       * Matches patterns like:
       *   bg-slate-900, text-amber-500, border-emerald-300,
       *   hover:bg-slate-800, group-hover:text-red-400, bg-blue-500/30
       *
       * Does NOT match:
       *   bg-bg-card, text-accent, bg-gold-500  (these are tokens)
       *   bg-transparent, bg-current            (these are theme-agnostic)
       * ─────────────────────────────────────────────────────────────────── */
      {
        selector:
          'Literal[value=/(?:^|\\s)(?:hover:|focus:|active:|group-hover:|disabled:)?(?:bg|text|border|ring|shadow|from|to|via|fill|stroke|outline|divide|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}(?:\\/\\d+)?(?=\\s|$)/]',
        message:
          'Raw Tailwind palette colors (bg-slate-900, text-amber-500, ...) do not flip with the theme. Use design tokens instead: bg-bg-card, text-text-main, text-accent, border-border-medium, bg-success/10, etc. See apps/web/TAILWIND.md for the full token map.',
      },

      /* ─────────────────────────────────────────────────────────────────────
       * BLOCK: `dark:` variant classes
       *
       * This platform's theme is class-based (`.light-theme` on <html>),
       * not media-based. Tailwind's `dark:` variant activates on
       * prefers-color-scheme OR a `.dark` class — neither matches this
       * platform's theme system. `dark:` classes are dead code.
       * ─────────────────────────────────────────────────────────────────── */
      {
        selector: 'Literal[value=/(?:^|\\s)dark:/]',
        message:
          'The `dark:` variant never activates on this platform (theme is class-based via `.light-theme`, not media-based). Use token classes that flip automatically: bg-bg-card, text-text-main, etc.',
      },

      /* ─────────────────────────────────────────────────────────────────────
       * BLOCK: Raw hex colors in arbitrary-value classes
       *
       *   bg-[#f59e0b]  text-[#FFA751]  border-[#b45309]
       * ─────────────────────────────────────────────────────────────────── */
      {
        selector:
          'Literal[value=/(?:^|\\s)(?:bg|text|border|ring|shadow|from|to|via)-\\[#[0-9a-fA-F]{3,8}\\]/]',
        message:
          'Raw hex colors bypass the design system. Add the color as a token in themes.css, expose it in tailwind.config.js, then use the token name (bg-accent, text-gold-500, etc.).',
      },

      /* ─────────────────────────────────────────────────────────────────────
       * BLOCK: Raw rgba()/rgb() inside arbitrary-value classes
       *
       *   shadow-[0_0_20px_rgba(245,158,11,0.25)]
       *   bg-[rgba(16,185,129,0.1)]
       * ─────────────────────────────────────────────────────────────────── */
      {
        selector:
          'Literal[value=/(?:^|\\s)(?:bg|text|border|ring|shadow|from|to|via)-\\[[^\\]]*rgba?\\(/]',
        message:
          'Raw rgba()/rgb() values bypass the design system. Use an existing shadow token (shadow-glow-gold, shadow-lg) or add a new one to themes.css.',
      },
    ],

    /* ========================================================================
     * GENERAL CODE QUALITY
     * ===================================================================== */

    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],

    /* ========================================================================
     * REACT — hooks rules stay at `error` (real correctness, not style debt)
     * ===================================================================== */

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/no-unknown-property': 'error',
  },

  /* ========================================================================
   * PER-FILE OVERRIDES
   *
   * Build tooling config files run in Node and declare colors as plain
   * hex strings — that IS the token definition, not a violation.
   * ===================================================================== */
  overrides: [
    {
      files: ['tailwind.config.js', 'postcss.config.js', 'next.config.js'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};