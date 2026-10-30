/**
 * @fileoverview Theme Context
 *
 * Single source of truth for dark/light mode. Applies BOTH signaling
 * mechanisms on <html> so every stylesheet convention works:
 *   - class "light-theme"      (themes.css, design-system.css)
 *   - attribute data-theme     (referral.css, admin-mlm.css overrides)
 *
 * The default theme is read from packages/shared/config/theme.config.js
 * via the config bridge — change it in ONE place and every layer follows.
 *
 * Anti-flash: pages/_document.jsx runs an inline script BEFORE first paint
 * that reads localStorage and applies the correct class/attribute. This
 * provider then re-syncs on mount to guarantee state consistency and to
 * recover from any SSR/client hydration edge cases.
 *
 * Path: apps/web/context/ThemeContext.js
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@lib/storage';
import { getThemeConfig } from '../lib/config';

const ThemeContext = createContext(null);

/**
 * Resolved theme configuration from the shared config bridge.
 * All values — default theme, storage key, class name, data attribute —
 * flow from packages/shared/config/theme.config.js. Zero hardcoded strings.
 */
const THEME_CONFIG = getThemeConfig();
const DEFAULT_THEME = THEME_CONFIG.defaultTheme;
const STORAGE_KEY = THEME_CONFIG.storageKey;
const LIGHT_CLASS = THEME_CONFIG.lightClassName;
const DATA_ATTR = THEME_CONFIG.dataAttribute;
const SUPPORTED_THEMES = THEME_CONFIG.supportedThemes;

/**
 * Normalizes any input to a supported theme identifier.
 * Falls back to the configured default when input is unknown.
 *
 * @param {string} value - Candidate theme name
 * @returns {string} A value guaranteed to be in supportedThemes
 */
const normalizeTheme = (value) => {
  return SUPPORTED_THEMES.includes(value) ? value : DEFAULT_THEME;
};

/**
 * Applies the theme to the document root using both signaling conventions.
 *
 * @param {string} themeName - 'light' or 'dark'
 */
const applyThemeToDocument = (themeName) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle(LIGHT_CLASS, themeName === 'light');
  root.setAttribute(DATA_ATTR, themeName);
};

const ThemeProvider = ({ children }) => {
  /*
   * Start with the configured default theme — not a value read from
   * storage during render. Reading storage during render would cause a
   * hydration mismatch because the server has no access to localStorage.
   *
   * The _document.jsx inline script has already painted the correct
   * theme before this provider mounts, so the mount effect below simply
   * re-syncs state and DOM to be certain they agree.
   */
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /*
     * Read the saved preference (or fall back to the configured default).
     * If _document.jsx already applied the correct class/attribute,
     * this is a no-op — but it guarantees state and DOM agree even if
     * the inline script was blocked or failed silently.
     */
    const savedTheme = getItem(STORAGE_KEY, DEFAULT_THEME);
    const resolvedTheme = normalizeTheme(savedTheme);

    setThemeState(resolvedTheme);
    applyThemeToDocument(resolvedTheme);
    setMounted(true);
  }, []);

  /**
   * Toggles between light and dark mode and persists the choice.
   */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      setItem(STORAGE_KEY, nextTheme);
      applyThemeToDocument(nextTheme);
      return nextTheme;
    });
  }, []);

  /**
   * Sets a specific theme by name and persists the choice.
   * Unknown values silently fall back to the configured default.
   *
   * @param {string} themeName - 'light' or 'dark'
   */
  const setTheme = useCallback((themeName) => {
    const resolvedTheme = normalizeTheme(themeName);
    setThemeState(resolvedTheme);
    setItem(STORAGE_KEY, resolvedTheme);
    applyThemeToDocument(resolvedTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to consume theme context.
 * Returns safe defaults derived from the shared config when used outside
 * ThemeProvider (e.g. during SSR or isolated component tests).
 */
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    return {
      theme: DEFAULT_THEME,
      toggleTheme: () => {},
      setTheme: () => {},
      mounted: false,
    };
  }
  return context;
};

export { ThemeProvider, useTheme };