/**
 * @fileoverview Theme Configuration
 *
 * Single source of truth for the platform's default theme.
 * Change `defaultTheme` here once and every layer picks it up:
 *   - context/ThemeContext.js       (React state default)
 *   - pages/_document.jsx           (pre-hydration inline script)
 *   - components/shared/ThemeToggle.jsx (fallback state)
 *
 * Valid values: 'dark' | 'light'
 *
 * Path: packages/shared/config/theme.config.js
 */

const themeConfig = {
  /*
   * The theme every new visitor gets before they toggle anything.
   * Returning visitors keep whatever they last chose — persisted in
   * localStorage under the key below.
   */
  defaultTheme: 'dark',

  /*
   * Valid theme identifiers. Extend here if a third theme is ever added.
   */
  supportedThemes: ['dark', 'light'],

  /*
   * localStorage key used to persist the visitor's choice.
   * Must match the key read in pages/_document.jsx.
   */
  storageKey: 'theme',

  /*
   * CSS class applied to <html> when the light theme is active.
   * `themes.css` scopes all light-mode overrides to `.light-theme`.
   */
  lightClassName: 'light-theme',

  /*
   * Data attribute applied to <html>. Read by referral.css,
   * admin-mlm.css, and any other stylesheet that targets
   * [data-theme="light"] or [data-theme="dark"].
   */
  dataAttribute: 'data-theme',
};

module.exports = themeConfig;