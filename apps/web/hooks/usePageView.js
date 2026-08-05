/**
 * @fileoverview Page View Tracking Hook
 * Fires once per page load — sends path to analytics API.
 * Path: apps/web/hooks/usePageView.js
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Tracks page views anonymously.
 * Add to _app.jsx to track every page.
 */
const usePageView = () => {
  const router = useRouter();

  useEffect(() => {
    const trackPage = () => {
      try {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname }),
        });
      } catch {
        /* Silent — analytics should never break the app */
      }
    };

    /*
     * Track on initial load
     */
    trackPage();

    /*
     * Track on route changes
     */
    router.events.on('routeChangeComplete', trackPage);

    return () => {
      router.events.off('routeChangeComplete', trackPage);
    };
  }, [router.events]);
};

export default usePageView;