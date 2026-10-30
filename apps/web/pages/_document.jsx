/**
 * @fileoverview Custom Document Component
 *
 * Sets up HTML document structure with font preloading, default meta tags,
 * and a pre-hydration theme script that eliminates the flash of wrong
 * theme on first load.
 *
 * Theme configuration is read through the shared config bridge
 * (lib/config.js → getThemeConfig()), which resolves from
 * packages/shared/config/theme.config.js via the @shared webpack alias.
 * This keeps the default theme defined in exactly one place across the
 * entire platform.
 *
 * Since _document runs only on the server, resolving config synchronously
 * here has zero impact on the client bundle.
 *
 * Path: apps/web/pages/_document.jsx
 */

import { Html, Head, Main, NextScript } from 'next/document';
import { getThemeConfig } from '../lib/config';

/**
 * Resolved theme configuration from the shared config bridge.
 * All values flow from packages/shared/config/theme.config.js.
 */
const themeConfig = getThemeConfig();

const {
  defaultTheme,
  storageKey,
  lightClassName,
  dataAttribute,
  supportedThemes,
} = themeConfig;

/**
 * Builds the inline anti-flash script from the shared theme config.
 *
 * It runs BEFORE first paint and synchronously applies the saved theme
 * (or the configured default) to <html>. This is the only reliable way
 * to prevent the "flash of wrong theme" that would otherwise occur while
 * React boots up.
 *
 * Rules:
 *   - Saved value is 'light'  → add light class, set data attribute
 *   - Saved value is 'dark'   → remove light class, set data attribute
 *   - Saved value missing     → apply the configured default theme
 *   - Any error (blocked storage, etc.) → fail silently to the default
 *
 * @returns {string} Serialized inline script
 */
const buildThemeInitScript = () => {
  const config = JSON.stringify({
    defaultTheme,
    storageKey,
    lightClassName,
    dataAttribute,
    supportedThemes,
  });

  return `
    (function() {
      try {
        var config = ${config};
        var saved = null;
        try { saved = localStorage.getItem(config.storageKey); } catch (e) {}
        var theme = config.supportedThemes.indexOf(saved) !== -1
          ? saved
          : config.defaultTheme;
        var root = document.documentElement;
        if (theme === 'light') {
          root.classList.add(config.lightClassName);
        } else {
          root.classList.remove(config.lightClassName);
        }
        root.setAttribute(config.dataAttribute, theme);
      } catch (e) {
        // Storage unavailable or blocked — default theme already in markup
      }
    })();
  `;
};

/**
 * Custom Document for Abyssinia Academy.
 * Fonts are preloaded here because _document runs only on the server.
 */
const Document = () => {
  return (
    <Html lang="en" data-theme={defaultTheme}>
      <Head>
        {/* Font preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Satoshi font — primary brand font */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />

        {/* Inter font — fallback */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />

        {/* Default meta tags — overridden per-page by SEOHead */}
        <meta name="theme-color" content="#070b14" />

        {/*
         * CRITICAL: Anti-flash theme init.
         * This MUST be the first script in <Head> so it executes
         * before any CSS is parsed and before the browser paints.
         */}
        <script dangerouslySetInnerHTML={{ __html: buildThemeInitScript() }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;