/**
 * @fileoverview SEO Head Component
 * Path: apps/web/components/shared/SEOHead.jsx
 */

import Head from 'next/head';
import { platform as getPlatform } from '@lib/config';

const SEOHead = ({ title, description }) => {
  const platformConfig = getPlatform();
  const siteName = `${platformConfig.brand?.name || 'ABYSSiNIA'} ${platformConfig.brand?.suffix || 'Tech Academy'}`;
  const pageTitle = title ? `${title} | ${siteName}` : `${siteName} - ${platformConfig.brand?.tagline || ''}`;
  const pageDescription = description || platformConfig.brand?.tagline || '';

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#070b14" />
      <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
    </Head>
  );
};

export default SEOHead;