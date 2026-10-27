/**
 * @fileoverview Custom Document Component
 * Sets up HTML document structure with font preloading and default OG tags.
 * These tags apply to every page as fallbacks — individual pages override via SEOHead.
 * 
 * Path: apps/web/pages/_document.jsx
 */

import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document for Abyssinia Academy.
 * Fonts are preloaded here because _document runs only on the server.
 */
const Document = () => {
  return (
    <Html lang="en">
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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;