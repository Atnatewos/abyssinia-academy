/**
 * @fileoverview Theme Toggle — Standalone button variant
 * Mirrors the inline theme button in Navigation so components that
 * need an isolated toggle can reuse the same behaviour.
 *
 * Path: apps/web/components/shared/ThemeToggle.jsx
 */
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = 'nav-icon-btn nav-theme-btn' }) => {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {mounted && (theme === 'dark' ? <Sun /> : <Moon />)}
    </button>
  );
};

export default ThemeToggle;