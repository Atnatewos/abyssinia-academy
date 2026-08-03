/**
 * @fileoverview SEO Head Component
 * Dynamic meta tags for social sharing and search engines
 * Reads brand identity from platform config — zero hardcoded values
 * Path: apps/web/components/shared/SEOHead.jsx
 */

import Head from 'next/head';
import { getPlatform } from '../../lib/config';

/**
 * SEOHead — Renders dynamic <head> meta tags
 * Uses platform config for site name, tagline, and brand identity
 *
 * @param {object} props
 * @param {string} [props.title] - Page-specific title (appended to site name)
 * @param {string} [props.description] - Page-specific meta description
 * @param {string} [props.image] - Open Graph image URL
 * @param {string} [props.url] - Canonical URL
 */
const SEOHead = ({
  title = '',
  description = '',
  image = '/images/og-default.jpg',
  url = '',
}) => {
  /*
   * Load brand identity from platform config
   * All values come from packages/shared/config/platform.config.js
   */
  const platformConfig = getPlatform();
  const brand = platformConfig.brand || {};

  const siteName = `${brand.name || 'ABYSSiNIA'} ${brand.suffix || 'Tech Academy'}`;
  const tagline = brand.tagline || 'Master Full-Stack Engineering from Ethiopia to the World';
  const pageTitle = title ? `${title} | ${siteName}` : `${siteName} - ${tagline}`;
  const pageDescription = description || tagline;
  const siteUrl = platformConfig.frontendUrl || brand.website || 'https://abyssinia.academy';
  const pageUrl = url || siteUrl;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#020617" />
      <meta name="application-name" content={siteName} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />

      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/images/logo.svg" />
    </Head>
  );
};

export default SEOHead;