/**
 * @fileoverview Banner Visibility Context
 *
 * Single source of truth for whether the top promotional banner is
 * visible. Persists the dismissal timestamp to localStorage so the
 * user doesn't see the same banner on every page load.
 *
 * After `dismissStorageDays` days, the stored timestamp expires and
 * the banner reappears — catching fresh campaigns while respecting
 * the user's dismissal in the short term.
 *
 * Consumers:
 *   - <Banner />       reads `isVisible`, calls `dismiss()`
 *   - <PageLayout />   reads `headerHeight` to pad <main>
 *   - <Navigation />   reads `isVisible` to adjust its own top offset
 *
 * Path: apps/web/context/BannerContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getPlatformConfig } from '../lib/config';
import { getItem, setItem, removeItem } from '../lib/storage';

const BannerContext = createContext(null);

/**
 * Resolve the banner config once at module load. Every consumer reads
 * the same values, so there's zero drift.
 */
const PLATFORM_CONFIG = getPlatformConfig();
const BANNER_CONFIG = PLATFORM_CONFIG?.banner || {};
const IS_ENABLED = BANNER_CONFIG.enabled !== false;
const DISMISS_DAYS = Number(BANNER_CONFIG.dismissStorageDays) || 30;
const STORAGE_KEY = BANNER_CONFIG.storageKey || 'abyssinia_banner_dismissed_until';
const BANNER_HEIGHT = Number(BANNER_CONFIG.heightPx) || 40;
const NAV_HEIGHT = 72;
const ANIMATION_MS = Number(BANNER_CONFIG.animationDurationMs) || 300;

/**
 * Check whether the user has an active dismissal window.
 * Returns true if the banner should stay hidden.
 *
 * @returns {boolean}
 */
const isCurrentlyDismissed = () => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = getItem(STORAGE_KEY);
    if (!raw) return false;
    const dismissedUntil = Number(raw);
    if (!Number.isFinite(dismissedUntil)) return false;
    return Date.now() < dismissedUntil;
  } catch {
    return false;
  }
};

const BannerProvider = ({ children }) => {
  /**
   * isVisible is false until mount resolves the localStorage check.
   * This prevents an SSR/client hydration mismatch (server has no
   * access to localStorage, so it must render as if dismissed — then
   * the client reveals the banner after the check).
   */
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /* Master kill switch — respect config.banner.enabled */
    if (!IS_ENABLED) {
      setIsVisible(false);
      setMounted(true);
      return;
    }

    const dismissed = isCurrentlyDismissed();
    setIsVisible(!dismissed);
    setMounted(true);
  }, []);

  /**
   * Dismiss the banner and persist the dismissal window.
   * Cleans up expired timestamps on the fly.
   */
  const dismiss = useCallback(() => {
    setIsVisible(false);
    try {
      const dismissUntil = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
      setItem(STORAGE_KEY, String(dismissUntil));
    } catch {
      /* localStorage unavailable — dismissal stays in-memory for the session */
    }
  }, []);

  /**
   * Force-show the banner (useful for admin previews / "don't miss out"
   * campaigns). Clears the stored dismissal.
   */
  const show = useCallback(() => {
    setIsVisible(true);
    try {
      removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /**
   * Total header height for the current state. Consumers use this to
   * pad the page content without guessing.
   *   visible   → 40 (banner) + 72 (nav) = 112px
   *   dismissed → 72px (nav only)
   */
  const headerHeight = useMemo(
    () => NAV_HEIGHT + (isVisible ? BANNER_HEIGHT : 0),
    [isVisible]
  );

  const value = useMemo(
    () => ({
      isVisible,
      mounted,
      dismiss,
      show,
      headerHeight,
      bannerHeight: BANNER_HEIGHT,
      navHeight: NAV_HEIGHT,
      animationDurationMs: ANIMATION_MS,
    }),
    [isVisible, mounted, dismiss, show, headerHeight]
  );

  return <BannerContext.Provider value={value}>{children}</BannerContext.Provider>;
};

/**
 * Consume banner state. Safe defaults when used outside provider
 * (returns "not visible" with a standard nav-only height).
 */
const useBanner = () => {
  const ctx = useContext(BannerContext);
  if (!ctx) {
    return {
      isVisible: false,
      mounted: false,
      dismiss: () => {},
      show: () => {},
      headerHeight: NAV_HEIGHT,
      bannerHeight: BANNER_HEIGHT,
      navHeight: NAV_HEIGHT,
      animationDurationMs: ANIMATION_MS,
    };
  }
  return ctx;
};

export { BannerProvider, useBanner };