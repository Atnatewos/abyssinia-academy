/**
 * @fileoverview Next.js Configuration
 *
 * Central build + runtime config for the Abyssinia Academy frontend.
 * Owns:
 *   - Image domains (remote image optimization whitelist)
 *   - Legacy URL rewrites (preserves old bookmarks/links after refactors)
 *   - Production source map settings (security: off by default)
 *
 * All redirects use Next.js rewrites (transparent URL masking) instead of
 * client-side navigation, so legacy links land users on the correct page
 * without a visible URL change — zero 404s on old paths.
 *
 * Path: apps/web/next.config.js
 */

const nextConfig = {
  reactStrictMode: true,

  /* Images served from external CDNs (Unsplash hero previews, etc.) */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  /**
   * Legacy route rewrites — keep old paths working transparently.
   *
   * Rewrites (not redirects) so the URL the user typed stays in the
   * address bar, avoiding disorienting URL jumps. The target page
   * renders as if the user had navigated there directly.
   *
   * /login            → /auth/login         (legacy auth path)
   * /support          → /contact            (merged into contact page)
   * /discounts        → /pricing            (promo codes apply at checkout)
   * /profile/password → /profile/edit       (password section on edit page)
   */
  async rewrites() {
    return [
      { source: '/login', destination: '/auth/login' },
      { source: '/support', destination: '/contact' },
      { source: '/discounts', destination: '/pricing' },
      { source: '/profile/password', destination: '/profile/edit' },
    ];
  },

  /* Production source maps disabled — prevents reverse engineering */
  productionBrowserSourceMaps: false,

  /* Experimental: server actions for form submissions (future-proofing) */
  // experimental: {
  //   serverActions: false,
  // },
};

module.exports = nextConfig;