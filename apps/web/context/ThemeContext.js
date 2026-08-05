/**
 * @fileoverview Theme Context
 * Dark/light mode management with localStorage persistence.
 * Default: light mode for new visitors.
 * Returning visitors get their saved preference.
 * Path: apps/web/context/ThemeContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@lib/storage';

const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  /*
   * Default to light mode for new visitors.
   * Saved preference overrides the default on mount.
   */
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = getItem('theme', 'light');
    setThemeState(savedTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light-theme', savedTheme === 'light');
    }
    setMounted(true);
  }, []);

  /**
   * Toggle between light and dark mode.
   * Persists choice to localStorage.
   */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      setItem('theme', newTheme);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('light-theme', newTheme === 'light');
      }
      return newTheme;
    });
  }, []);

  /**
   * Set a specific theme directly.
   * @param {string} themeName - 'light' or 'dark'
   */
  const setTheme = useCallback((themeName) => {
    setThemeState(themeName);
    setItem('theme', themeName);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light-theme', themeName === 'light');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to consume theme context.
 * Returns safe light-mode defaults when used outside ThemeProvider.
 */
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    return { theme: 'light', toggleTheme: () => {}, setTheme: () => {}, mounted: false };
  }
  return context;
};

export { ThemeProvider, useTheme };