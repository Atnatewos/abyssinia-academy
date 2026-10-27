/**
 * @fileoverview Language Context
 * Multilingual EN/AM/TI/OM support with translations loaded from shared i18n
 * config files. Single source of truth: packages/shared/config/i18n/<locale>/index.js
 *
 * To add a new language:
 *   1. Create packages/shared/config/i18n/<locale>/ with all namespace files
 *   2. Register the loader below
 *   3. Add the language to LANGUAGE_ORDER and supportedLanguages config
 *
 * Path: apps/web/context/LanguageContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getItem, setItem } from '../lib/storage';

/*
 * Locale registry — single source of truth for supported languages.
 * `load` is a lazy require wrapped in try/catch so a missing/broken locale
 * file never crashes the app at import time.
 *
 * Adding a language = adding one entry here. No other code changes required.
 */
const LOCALE_REGISTRY = {
  en: {
    label: 'English',
    nativeLabel: 'English',
    load: () => require('../../../packages/shared/config/i18n/en'),
  },
  am: {
    label: 'Amharic',
    nativeLabel: 'አማርኛ',
    load: () => require('../../../packages/shared/config/i18n/am'),
  },
  ti: {
    label: 'Tigrinya',
    nativeLabel: 'ትግርኛ',
    load: () => require('../../../packages/shared/config/i18n/ti'),
  },
  om: {
    label: 'Oromo',
    nativeLabel: 'Afaan Oromoo',
    load: () => require('../../../packages/shared/config/i18n/om'),
  },
};

const DEFAULT_LANGUAGE = 'en';

/*
 * Resolve every locale once at module load. Any locale whose module fails
 * to import resolves to an empty object so the UI degrades gracefully and
 * falls back to the default language rather than crashing.
 */
const TRANSLATIONS = Object.fromEntries(
  Object.entries(LOCALE_REGISTRY).map(([code, { load }]) => {
    try {
      return [code, load()];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[i18n] Failed to load locale "${code}":`, error);
      return [code, {}];
    }
  })
);

/*
 * Public language descriptor list consumed by language pickers and settings
 * screens. Ordered so cycle-based toggles behave deterministically.
 */
const LANGUAGE_ORDER = Object.keys(LOCALE_REGISTRY);

const SUPPORTED_LANGUAGES = LANGUAGE_ORDER.map((code) => ({
  code,
  label: LOCALE_REGISTRY[code].label,
  nativeLabel: LOCALE_REGISTRY[code].nativeLabel,
}));

const LanguageContext = createContext(null);

/**
 * Language Provider Component
 * Wraps the app to provide multilingual support via shared i18n config.
 * Language preference persists in localStorage under 'abyssinia_language'.
 *
 * @param {{ children: React.ReactNode }} props
 */
const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  /*
   * On mount, restore saved language preference from localStorage.
   * Only accepts codes that resolve to a valid, non-empty translation
   * object so a corrupted or removed locale can never be activated.
   */
  useEffect(() => {
    const savedLanguage = getItem('abyssinia_language', DEFAULT_LANGUAGE);
    const isValidLanguage =
      LANGUAGE_ORDER.includes(savedLanguage) &&
      TRANSLATIONS[savedLanguage] &&
      Object.keys(TRANSLATIONS[savedLanguage]).length > 0;

    setLanguageState(isValidLanguage ? savedLanguage : DEFAULT_LANGUAGE);
    setMounted(true);
  }, []);

  /*
   * Current translation object — memoized to avoid re-renders.
   * Falls back to the default language if the current language has no
   * translations loaded (e.g., a broken locale module).
   */
  const t = useMemo(() => {
    const active = TRANSLATIONS[language];
    if (active && Object.keys(active).length > 0) return active;
    return TRANSLATIONS[DEFAULT_LANGUAGE] || {};
  }, [language]);

  /*
   * Cycle through all supported languages in registry order.
   * Safe to call regardless of how many locales are registered.
   */
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const currentIndex = LANGUAGE_ORDER.indexOf(prev);
      const nextIndex = (currentIndex + 1) % LANGUAGE_ORDER.length;
      const nextLanguage = LANGUAGE_ORDER[nextIndex];
      setItem('abyssinia_language', nextLanguage);
      return nextLanguage;
    });
  }, []);

  /*
   * Set a specific language by code.
   * Silently ignores unknown or unloaded language codes.
   */
  const setLanguage = useCallback((lang) => {
    const isKnown = LANGUAGE_ORDER.includes(lang);
    const isLoaded =
      isKnown && TRANSLATIONS[lang] && Object.keys(TRANSLATIONS[lang]).length > 0;
    if (isLoaded) {
      setLanguageState(lang);
      setItem('abyssinia_language', lang);
    }
  }, []);

  /*
   * Memoize the context value so consumers only re-render when a piece of
   * state they actually depend on changes.
   */
  const value = useMemo(
    () => ({
      language,
      t,
      toggleLanguage,
      setLanguage,
      mounted,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, t, toggleLanguage, setLanguage, mounted]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to consume language context.
 * Returns safe defaults if used outside LanguageProvider — prevents crashes
 * during SSR, tests, or isolated component renders.
 *
 * @returns {{
 *   language: string,
 *   t: Record<string, unknown>,
 *   toggleLanguage: () => void,
 *   setLanguage: (lang: string) => void,
 *   mounted: boolean,
 *   supportedLanguages: Array<{ code: string, label: string, nativeLabel: string }>
 * }}
 */
const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === null) {
    return {
      language: DEFAULT_LANGUAGE,
      t: TRANSLATIONS[DEFAULT_LANGUAGE] || {},
      toggleLanguage: () => {},
      setLanguage: () => {},
      mounted: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }

  return context;
};

export {
  LanguageProvider,
  useLanguage,
  TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  LANGUAGE_ORDER,
  DEFAULT_LANGUAGE,
};