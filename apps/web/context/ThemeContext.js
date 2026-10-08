/**
 * @fileoverview Theme Context
 *
 * Single source of truth for dark/light mode. Applies BOTH signaling
 * mechanisms on <html> so every stylesheet convention works:
 *   - class "light-theme"      (themes.css, design-system.css)
 *   - attribute data-theme     (referral.css, admin-mlm.css overrides)
 *
 * Path: apps/web/context/ThemeContext.js
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@lib/storage';

const ThemeContext = createContext(null);

/**
 * Applies the theme to the document root using both conventions.
 * @param {string} themeName - 'light' or 'dark'
 */
const applyThemeToDocument = (themeName) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('light-theme', themeName === 'light');
  document.documentElement.setAttribute('data-theme', themeName);
};

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = getItem('theme', 'light');
    setThemeState(savedTheme);
    applyThemeToDocument(savedTheme);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      setItem('theme', nextTheme);
      applyThemeToDocument(nextTheme);
      return nextTheme;
    });
  }, []);

  const setTheme = useCallback((themeName) => {
    setThemeState(themeName);
    setItem('theme', themeName);
    applyThemeToDocument(themeName);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    return { theme: 'light', toggleTheme: () => {}, setTheme: () => {}, mounted: false };
  }
  return context;
};

export { ThemeProvider, useTheme };