/**
 * @fileoverview Language Context
 * Bilingual EN/AM support with translations loaded from shared i18n config files
 * Single source of truth: packages/shared/config/i18n/en.config.js and am.config.js
 * To add a new language: create a new config file + add it here
 * Path: apps/web/context/LanguageContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getItem, setItem } from '../lib/storage';

/*
 * Load translations from shared i18n config files
 * Falls back to embedded minimal translations if config import fails
 * This is the ONLY place translations are loaded — components use useLanguage().t
 */
let enTranslations;
let amTranslations;

try {
  enTranslations = require('../../../packages/shared/config/i18n/en.config');
} catch {
  enTranslations = null;
}

try {
  amTranslations = require('../../../packages/shared/config/i18n/am.config');
} catch {
  amTranslations = null;
}

/*
 * Build the translations map from imported config files
 * If config import fails, use empty objects — the UI will show fallback text
 */
const TRANSLATIONS = {
  en: enTranslations || {},
  am: amTranslations || {},
};

const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext(null);

/**
 * Language Provider Component
 * Wraps the app to provide multilingual support via shared i18n config
 * Language preference persists in localStorage under 'abyssinia_language'
 *
 * To add a new language:
 * 1. Create packages/shared/config/i18n/fr.config.js (copy en.config.js keys)
 * 2. Add `const frTranslations = require('.../fr.config')` above
 * 3. Add `fr: frTranslations` to the TRANSLATIONS object
 * 4. Add the language to supportedLanguages in i18n/index.js
 */
const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  /*
   * On mount, restore saved language preference from localStorage
   * Validates that the saved language actually exists in TRANSLATIONS
   */
  useEffect(() => {
    const savedLanguage = getItem('abyssinia_language', DEFAULT_LANGUAGE);
    const isValidLanguage = TRANSLATIONS[savedLanguage] !== undefined;
    setLanguageState(isValidLanguage ? savedLanguage : DEFAULT_LANGUAGE);
    setMounted(true);
  }, []);

  /*
   * Current translation object — memoized to avoid re-renders
   * Always falls back to default language if current language is missing
   */
  const t = useMemo(() => {
    return TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE] || {};
  }, [language]);

  /*
   * Toggle between first two available languages
   * For more than 2 languages, extend this logic or use setLanguage directly
   */
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const newLang = prev === 'en' ? 'am' : 'en';
      setItem('abyssinia_language', newLang);
      return newLang;
    });
  }, []);

  /*
   * Set a specific language by code
   * Silently ignores invalid language codes
   */
  const setLanguage = useCallback((lang) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      setItem('abyssinia_language', lang);
    }
  }, []);

  const value = {
    language,
    t,
    toggleLanguage,
    setLanguage,
    mounted,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to consume language context
 * Returns safe defaults if used outside LanguageProvider
 * This prevents crashes during SSR or testing
 *
 * @returns {object} { language, t, toggleLanguage, setLanguage, mounted }
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
    };
  }

  return context;
};

export { LanguageProvider, useLanguage, TRANSLATIONS };