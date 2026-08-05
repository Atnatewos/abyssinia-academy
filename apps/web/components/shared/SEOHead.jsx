/**
 * @fileoverview SEO Head Component
 * Dynamic meta tags for social sharing previews, search engines, and messaging apps.
 * Auto-detects the current domain — zero hardcoded URLs.
 * 
 * When no image is provided, social platforms will scrape the page's visible
 * hero content (headings, descriptions, logos) and generate a preview automatically.
 * 
 * Path: apps/web/components/shared/SEOHead.jsx
 */

import Head from 'next/head';
import { getPlatform } from '../../lib/config';
import { getBaseUrl } from '../../lib/url';

/**
 * SEOHead — Renders dynamic <head> meta tags for rich link previews.
 * 
 * Preview priority:
 * 1. If `image` prop is provided → uses that image
 * 2. If no image → Facebook/Twitter/Discord will scrape the page's hero section
 *    and generate a preview from the visible content (title, logo, heading)
 *
 * @param {object} props
 * @param {string} [props.title] - Page-specific title
 * @param {string} [props.description] - Page-specific meta description
 * @param {string} [props.image] - Optional custom OG image path
 * @param {string} [props.url] - Canonical URL path
 */
const SEOHead = ({
  title = '',
  description = '',
  image = '',
  url = '',
}) => {
  const platformConfig = getPlatform();
  const brand = platformConfig.brand || {};

  const siteName = `${brand.name || 'ABYSSiNIA'} ${brand.suffix || 'Tech Academy'}`;
  const tagline = brand.tagline || 'Master Full-Stack Engineering from Ethiopia to the World';
  const pageTitle = title ? `${title} | ${siteName}` : `${siteName} — ${tagline}`;
  const pageDescription = description || tagline;

  const baseUrl = getBaseUrl();
  const canonicalUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : '';

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

      {/* ── Open Graph (Facebook, LinkedIn, Discord, WhatsApp, Telegram, Slack) ── */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* 
       * If an image is provided, use it with dimensions.
       * If no image, the platform scrapers will auto-generate a preview
       * from the page's hero section (logo, heading, description).
       */}
      {imageUrl && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={pageTitle} />
        </>
      )}

      {/* ── Twitter / X Card ── */}
      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {imageUrl && (
        <>
          <meta name="twitter:image" content={imageUrl} />
          <meta name="twitter:image:alt" content={pageTitle} />
        </>
      )}

      {/* ── Icons ── */}
      <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
      <link rel="apple-touch-icon" href="/images/logo.svg" />
    </Head>
  );
};

export default SEOHead;