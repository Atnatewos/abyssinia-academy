/**
 * @fileoverview SEO Head Component
 * Dynamic meta tags for social sharing previews, search engines, and messaging apps.
 * Auto-detects the current domain — zero hardcoded URLs.
 * 
 * Features:
 * - Open Graph tags (Facebook, LinkedIn, Discord, WhatsApp, Telegram, iMessage)
 * - Twitter Card tags (X/Twitter)
 * - Auto-detected canonical URLs from the browser/request
 * - Absolute image URLs for external previews
 * - Config-driven brand identity from platform.config.js
 * 
 * Path: apps/web/components/shared/SEOHead.jsx
 */

import Head from 'next/head';
import { getPlatform } from '../../lib/config';
import { getBaseUrl } from '../../lib/url';

/**
 * SEOHead — Renders dynamic <head> meta tags for rich link previews.
 * Every URL is absolute (auto-detected domain) so previews work on any platform.
 *
 * @param {object} props
 * @param {string} [props.title] - Page-specific title (appended to site name)
 * @param {string} [props.description] - Page-specific meta description
 * @param {string} [props.image] - Open Graph image path (e.g., '/images/og-default.jpg')
 * @param {string} [props.url] - Canonical URL path (e.g., '/courses/fullstack')
 */
const SEOHead = ({
  title = '',
  description = '',
  image = '/images/og-default.png',
  url = '',
}) => {
  /*
   * Load brand identity from platform config
   * All values sourced from packages/shared/config/platform.config.js
   */
  const platformConfig = getPlatform();
  const brand = platformConfig.brand || {};

  const siteName = `${brand.name || 'ABYSSiNIA'} ${brand.suffix || 'Tech Academy'}`;
  const tagline = brand.tagline || 'Master Full-Stack Engineering from Ethiopia to the World';
  const pageTitle = title ? `${title} | ${siteName}` : `${siteName} — ${tagline}`;
  const pageDescription = description || tagline;

  /*
   * Auto-detect the base URL — works on localhost, Vercel preview, and production.
   * No .env or config changes needed when switching domains.
   */
  const baseUrl = getBaseUrl();

  /*
   * Build absolute URLs for canonical and image.
   * External platforms (Facebook, Twitter, Telegram, etc.) require absolute URLs
   * to fetch the preview image. Relative paths will NOT work.
   */
  const canonicalUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Head>
      {/* ── Primary Meta Tags ── */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#070b14" />
      <meta name="application-name" content={siteName} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph (Facebook, LinkedIn, Discord, WhatsApp, Telegram, iMessage, Slack) ── */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter / X Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={pageTitle} />

      {/* ── Icons ── */}
      <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
      <link rel="apple-touch-icon" href="/images/logo.svg" />
    </Head>
  );
};

export default SEOHead;