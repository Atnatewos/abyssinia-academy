/**
 * @fileoverview Tailwind CSS Configuration — Unified Design System
 *
 * Bridges Tailwind's utility engine to the platform's existing CSS variable
 * design system (styles/themes.css). Every color, radius, shadow, font,
 * spacing, and animation value below resolves to a CSS custom property,
 * which means:
 *
 *   - Dark and light themes stay perfectly in sync across both systems
 *   - A single edit to themes.css updates Tailwind and pure CSS together
 *   - Zero duplicated design tokens, zero drift
 *   - Full rebranding happens in one place (themes.css)
 *
 * Alpha-modifier support
 * ──────────────────────
 * Semantic colors are declared as `rgb(var(--X-rgb) / <alpha-value>)`.
 * This is the industry-standard pattern that makes `bg-success/10`,
 * `border-error/50`, and `text-accent/70` all compile to real rgba()
 * values at build time. Plain `var(--color-success)` CANNOT do this —
 * Tailwind's opacity math needs a resolvable color.
 *
 * The matching RGB triplets live in themes.css (both :root and
 * .light-theme). Keep them in sync with their hex counterparts.
 *
 * Preflight is disabled because the project already ships its own reset
 * in styles/globals.css. Enabling Preflight would double-reset the
 * document and risk visual regressions.
 *
 * Content globs intentionally include every JSX/TSX source file. Tailwind
 * only emits utility classes that are actually referenced, so scanning
 * all files is safe — this is the industry-standard configuration.
 *
 * Path: apps/web/tailwind.config.js
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  /*
   * Scan every source file that may contain Tailwind utilities.
   * Only classes that appear in these files are compiled into the bundle —
   * nothing else is emitted, which guarantees no style leakage.
   */
  content: [
    './pages/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './context/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx,mdx}',
  ],

  /*
   * Disable Preflight — the project already defines a comprehensive CSS
   * reset in styles/globals.css. Running both would produce conflicting
   * element-level styles. All reset behavior stays centralized in the
   * existing stylesheet.
   */
  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      /*
       * COLOR SYSTEM
       * Every color resolves through a CSS variable sourced from themes.css.
       * Semantic colors use the RGB-triplet form to enable opacity modifiers
       * (bg-success/10). Non-alpha colors use the plain `var()` form.
       */
      colors: {
        /* Backgrounds */
        'bg-main': 'var(--bg-main)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-card-solid': 'var(--bg-card-solid)',
        'bg-card-hover': 'var(--bg-card-hover)',
        'bg-pill': 'var(--bg-pill)',
        'bg-input': 'var(--bg-input)',
        'bg-overlay': 'var(--bg-overlay)',
        'bg-skeleton': 'var(--bg-skeleton)',
        'bg-nav': 'var(--bg-nav)',
        'bg-nav-scrolled': 'var(--bg-nav-scrolled)',
        'bg-pill-container': 'var(--bg-pill-container)',
        'bg-icon-btn-hover': 'var(--bg-icon-btn-hover)',
        'bg-mobile-menu': 'var(--bg-mobile-menu)',
        'bg-badge': 'var(--bg-badge)',
        'bg-ghost-hover': 'var(--bg-ghost-hover)',

        /* Surfaces */
        'surface-primary': 'var(--surface-primary)',
        'surface-secondary': 'var(--surface-secondary)',
        'surface-hover': 'var(--surface-hover)',

        /* Text */
        'text-main': 'var(--text-main)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
        'text-inverse': 'var(--text-inverse)',
        'text-nav-link': 'var(--text-nav-link)',
        'text-nav-link-hover': 'var(--text-nav-link-hover)',
        'text-nav-icon': 'var(--text-nav-icon)',
        'text-nav-icon-hover': 'var(--text-nav-icon-hover)',

        /* Gold scale — non-alpha, direct palette access */
        'gold-50': 'var(--gold-50)',
        'gold-100': 'var(--gold-100)',
        'gold-200': 'var(--gold-200)',
        'gold-300': 'var(--gold-300)',
        'gold-400': 'var(--gold-400)',
        'gold-500': 'var(--gold-500)',
        'gold-600': 'var(--gold-600)',
        'gold-700': 'var(--gold-700)',
        'gold-800': 'var(--gold-800)',
        'gold-900': 'var(--gold-900)',

        /* Accent — ALPHA-ENABLED (bg-accent/10, border-accent/30, etc.) */
        accent: 'rgb(var(--accent-gold-rgb) / <alpha-value>)',
        'accent-light': 'rgb(var(--accent-gold-light-rgb) / <alpha-value>)',
        'accent-dark': 'rgb(var(--accent-gold-dark-rgb) / <alpha-value>)',
        'accent-glow': 'var(--accent-gold-glow)',

        /* Semantic — ALPHA-ENABLED (bg-success/10, border-error/50, etc.) */
        success: 'rgb(var(--color-success-rgb) / <alpha-value>)',
        'success-bg': 'var(--color-success-bg)',
        error: 'rgb(var(--color-error-rgb) / <alpha-value>)',
        'error-bg': 'var(--color-error-bg)',
        warning: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
        'warning-bg': 'var(--color-warning-bg)',
        info: 'rgb(var(--color-info-rgb) / <alpha-value>)',
        'info-bg': 'var(--color-info-bg)',

        /* Borders */
        'border-main': 'var(--border-main)',
        'border-hover': 'var(--border-hover)',
        'border-light': 'var(--border-light)',
        'border-medium': 'var(--border-medium)',
        'border-nav': 'var(--border-nav)',
        'border-nav-scrolled': 'var(--border-nav-scrolled)',
        'border-pill': 'var(--border-pill)',
        'border-badge': 'var(--border-badge)',
        'border-mobile-link': 'var(--border-mobile-link)',
      },

      /*
       * BORDER RADIUS
       * Reads from CSS variables so a single edit in themes.css updates
       * every rounded corner in the app (Tailwind + pure CSS together).
       */
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        '4xl': 'var(--radius-4xl)',
        full: 'var(--radius-full)',
      },

      /*
       * BOX SHADOWS
       * Mapped to the same shadow tokens pure CSS uses so component
       * migrations never produce visual deltas. The `glow-gold` family
       * uses `rgb(var(--accent-gold-rgb) / alpha)` so it also rebrands
       * when the accent color changes.
       */
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        nav: 'var(--shadow-nav)',
        glow: '0 0 20px var(--glow-color)',
        'glow-strong': '0 0 32px var(--glow-strong)',
        'glow-gold': '0 4px 20px rgba(var(--accent-gold-rgb) / 0.25)',
        'glow-gold-lg': '0 6px 25px rgba(var(--accent-gold-rgb) / 0.4)',
        'glow-gold-sm': '0 0 20px rgba(var(--accent-gold-rgb) / 0.3)',
        none: 'none',
      },

      /*
       * TYPOGRAPHY
       * Font families and sizes match the platform's scale, sourced from
       * themes.css. Change the type scale in one place and both systems
       * update together.
       */
      fontFamily: {
        sans: ['var(--font-primary)'],
        mono: ['var(--font-mono)'],
      },

      fontSize: {
        '2xs': ['var(--font-size-2xs)', { lineHeight: 'var(--line-height-2xs)' }],
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-xs)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-sm)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-base)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-lg)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-xl)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-2xl)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-3xl)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-4xl)' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-5xl)' }],
        '6xl': ['var(--font-size-6xl)', { lineHeight: 'var(--line-height-6xl)' }],
      },

      /*
       * BACKDROP BLUR
       * Aligned with the glass effect tokens used in design-system.css.
       */
      backdropBlur: {
        glass: 'var(--glass-blur)',
        nav: 'var(--nav-glass-blur)',
      },

      /*
       * Z-INDEX SCALE
       * Every value reads from themes.css so layering stays synchronized
       * across Tailwind and pure CSS. Changing `--z-modal` in one place
       * updates every modal layer in the app.
       */
      zIndex: {
        base: 'var(--z-base)',
        above: 'var(--z-above)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        cart: 'var(--z-cart)',
        drawer: 'var(--z-drawer)',
        notification: 'var(--z-notification)',
      },

      /*
       * TRANSITION DURATIONS
       * Centralized in themes.css. Changing `--duration-fast` updates
       * every `duration-fast` utility in the app.
       */
      transitionDuration: {
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-base)',
        medium: 'var(--duration-medium)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      /*
       * ANIMATION
       * Map the design system's named animations to Tailwind utilities.
       * Keyframes themselves live in styles/animations.css; here we expose
       * them as `animate-<name>` classes. Colors inside keyframes resolve
       * through `rgb(var(--accent-gold-rgb) / alpha)` so they rebrand
       * automatically with the accent color.
       */
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '0.3',
            filter: 'drop-shadow(0 0 20px rgb(var(--accent-gold-rgb) / 0.3))',
          },
          '50%': {
            opacity: '0.7',
            filter: 'drop-shadow(0 0 40px rgb(var(--accent-gold-rgb) / 0.7))',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        badgePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        blob: 'blob 7s infinite',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },

  /*
   * SAFELIST
   * Classes constructed dynamically (template literals) cannot be
   * detected by Tailwind's static scanner. Add them here to guarantee
   * they are emitted. Keep this list minimal — each entry contributes
   * to the CSS bundle size.
   */
  safelist: [
    /* Status badges */
    'badge-success',
    'badge-error',
    'badge-warning',
    'badge-info',
    /* Dynamic grid columns used in admin dashboards */
    { pattern: /^grid-cols-(1|2|3|4|5|6|12)$/ },
    { pattern: /^col-span-(1|2|3|4|5|6|12)$/ },
    /* Dynamic gap scale used in layout components */
    { pattern: /^gap-(0|1|2|3|4|5|6|8|10|12)$/ },
  ],

  /*
   * PLUGINS
   * Reserved for future Tailwind plugins (forms, typography, aspect-ratio).
   * Kept empty to avoid unneeded bundle weight; add per-feature as needed.
   */
  plugins: [],
};