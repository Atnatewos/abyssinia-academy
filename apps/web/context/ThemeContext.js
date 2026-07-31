/**
 * @fileoverview Theme Context
 * Dark/light mode management with localStorage persistence
 * Path: apps/web/context/ThemeContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@lib/storage';

const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = getItem('theme', 'dark');
    setThemeState(savedTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light-theme', savedTheme === 'light');
    }
    setMounted(true);
  }, []);

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

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    return { theme: 'dark', toggleTheme: () => {}, setTheme: () => {}, mounted: false };
  }
  return context;
};

export { ThemeProvider, useTheme };