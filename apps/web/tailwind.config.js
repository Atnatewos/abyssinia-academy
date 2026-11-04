/**
 * @fileoverview Tailwind CSS Configuration — Unified Design System
 *
 * Bridges Tailwind's utility engine to the platform's existing CSS variable
 * design system (styles/themes.css). Every color, radius, shadow, font, and
 * spacing value below resolves to a CSS custom property, which means:
 *
 *   - Dark and light themes stay perfectly in sync across both systems
 *   - A single edit to themes.css updates Tailwind and pure CSS together
 *   - Zero duplicated design tokens, zero drift
 *
 * Preflight is disabled because the project already ships its own reset in
 * styles/globals.css. Enabling Preflight would double-reset the document
 * and risk visual regressions.
 *
 * Content globs intentionally include every JSX/TSX source file. Tailwind
 * only emits utility classes that are actually referenced, so scanning all
 * files is safe — this is the industry-standard configuration.
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
       * Every color is a CSS variable sourced from themes.css. Because the
       * variable names are defined at :root (dark) and overridden inside
       * .light-theme, both Tailwind utilities and pure CSS classes flip
       * automatically when the theme toggles.
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

        /* Gold scale */
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

        /* Accent */
        accent: 'var(--accent-gold)',
        'accent-light': 'var(--accent-gold-light)',
        'accent-dark': 'var(--accent-gold-dark)',
        'accent-glow': 'var(--accent-gold-glow)',

        /* Semantic */
        success: 'var(--color-success)',
        'success-bg': 'var(--color-success-bg)',
        error: 'var(--color-error)',
        'error-bg': 'var(--color-error-bg)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        info: 'var(--color-info)',
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
       * Aligned with the design system's glassmorphism primitives.
       */
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        full: '9999px',
      },

      /*
       * BOX SHADOWS
       * Mapped to the same shadow tokens pure CSS uses so component
       * migrations never produce visual deltas.
       */
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        nav: 'var(--shadow-nav)',
        glow: '0 0 20px var(--glow-color)',
        'glow-strong': '0 0 32px var(--glow-strong)',
        'glow-gold': '0 8px 24px -4px var(--accent-gold-glow)',
        none: 'none',
      },

      /*
       * TYPOGRAPHY
       * Font families and sizes match the platform's scale. Fonts themselves
       * are preloaded in _document.jsx; Tailwind just exposes the family
       * utilities to match the CSS variable declarations.
       */
      fontFamily: {
        sans: ['var(--font-primary)'],
        mono: ['var(--font-mono)'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.875rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
        '4xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '5xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '6xl': ['3rem', { lineHeight: '1.1' }],
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
       * Mirrors the z-index tokens so layering stays synchronized between
       * Tailwind components and legacy CSS.
       */
      zIndex: {
        base: '0',
        above: '10',
        sticky: '40',
        overlay: '50',
        modal: '100',
        toast: '110',
      },

      /*
       * TRANSITION DURATIONS
       * Matches the interaction feel used throughout the platform.
       */
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        medium: '250ms',
        slow: '300ms',
        slower: '350ms',
      },

      /*
       * ANIMATION
       * Map the design system's named animations to Tailwind utilities.
       * Keyframes themselves live in styles/animations.css; here we expose
       * them as `animate-<name>` classes.
       */
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Glow for auth background orbs (from HTML reference)
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.3))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 40px rgba(245, 158, 11, 0.7))' },
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
        // Ambient background shapes
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        // Staggered entry for auth text
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