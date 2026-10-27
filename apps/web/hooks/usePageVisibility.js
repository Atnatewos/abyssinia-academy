/**
 * @fileoverview Page Visibility Hook
 *
 * Detects when the browser tab is active (user is looking) vs backgrounded
 * (user switched tabs). Used by useNotifications to pause polling when the
 * tab is not visible, reducing Vercel API calls.
 *
 * @returns {boolean} isVisible - True when tab is active
 *
 * Path: apps/web/hooks/usePageVisibility.js
 */
import { useState, useEffect } from 'react';

const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true
  );

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

export default usePageVisibility;