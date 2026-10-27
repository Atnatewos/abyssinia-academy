/**
 * @fileoverview Theme & Animation Configuration
 * Controls design tokens, animations, and visual presets
 * Path: packages/shared/config/themes.config.js
 */

const themesConfig = {
  // Theme modes
  modes: {
    dark: 'dark',
    light: 'light',
  },

  // Color Palette
  colors: {
    dark: {
      bg: {
        main: '#070b14',
        card: 'rgba(15, 23, 42, 0.75)',
        cardSolid: '#0f172a',
        pill: 'rgba(30, 41, 59, 0.7)',
      },
      text: {
        main: '#f8fafc',
        muted: '#94a3b8',
      },
      border: {
        main: 'rgba(245, 158, 11, 0.2)',
        hover: 'rgba(245, 158, 11, 0.5)',
      },
      accent: {
        gold: '#f59e0b',
        goldHover: '#d97706',
        glow: 'rgba(245, 158, 11, 0.15)',
      },
      gradient: {
        gold: 'linear-gradient(135deg, #FFE259 0%, #FFA751 100%)',
      },
    },
    light: {
      bg: {
        main: '#f8fafc',
        card: 'rgba(255, 255, 255, 0.9)',
        cardSolid: '#ffffff',
        pill: '#f1f5f9',
      },
      text: {
        main: '#0f172a',
        muted: '#475569',
      },
      border: {
        main: 'rgba(217, 119, 6, 0.25)',
        hover: 'rgba(217, 119, 6, 0.6)',
      },
      accent: {
        gold: '#d97706',
        goldHover: '#b45309',
        glow: 'rgba(217, 119, 6, 0.12)',
      },
      gradient: {
        gold: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
      },
    },
  },

  // Animations
  animations: {
    float: {
      keyframe: 'float 5s ease-in-out infinite',
      class: 'animate-float',
    },
    pulseGlow: {
      keyframe: 'pulseGlow 6s ease-in-out infinite',
      class: 'animate-pulse-glow',
    },
    gradientShift: {
      keyframe: 'gradientShift 6s ease infinite',
      class: 'animate-gradient',
      style: 'background-size: 200% 200%',
    },
    fadeIn: {
      duration: '0.5s',
      class: 'animate-fade-in',
    },
    slideUp: {
      duration: '0.6s',
      class: 'animate-slide-up',
    },
    scaleIn: {
      duration: '0.4s',
      class: 'animate-scale-in',
    },
  },

  // Glassmorphism
  glass: {
    base: {
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-main)',
      boxShadow: '0 10px 30px -10px var(--glow-color)',
    },
    hover: {
      transform: 'translateY(-4px)',
      borderColor: 'var(--card-hover-border)',
      boxShadow: '0 20px 35px -10px var(--glow-color)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "'Satoshi', 'Inter', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },

  // Spacing Scale (in rem)
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  // Border Radius
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
  },
};

module.exports = themesConfig;