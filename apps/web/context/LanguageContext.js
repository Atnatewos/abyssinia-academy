// /**
//  * @fileoverview Language Context
//  * Multilingual EN/AM/TI/OM support with translations loaded from shared i18n
//  * config files.
//  *
//  * Uses Next.js router for client-side transitions to prevent hydration
//  * mismatches and full-page reloads when the language is toggled.
//  *
//  * Path: apps/web/context/LanguageContext.js
//  */

// import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
// import { useRouter } from 'next/router';
// import { getItem, setItem } from '../lib/storage';

// const LOCALE_REGISTRY = {
//   en: { label: 'English', nativeLabel: 'English', load: () => require('../../../packages/shared/config/i18n/en') },
//   am: { label: 'Amharic', nativeLabel: 'አማርኛ', load: () => require('../../../packages/shared/config/i18n/am') },
//   ti: { label: 'Tigrinya', nativeLabel: 'ትግርኛ', load: () => require('../../../packages/shared/config/i18n/ti') },
//   om: { label: 'Oromo', nativeLabel: 'Afaan Oromoo', load: () => require('../../../packages/shared/config/i18n/om') },
// };

// const DEFAULT_LANGUAGE = 'en';

// const TRANSLATIONS = Object.fromEntries(
//   Object.entries(LOCALE_REGISTRY).map(([code, { load }]) => {
//     try {
//       return [code, load()];
//     } catch (error) {
//       console.error(`[i18n] Failed to load locale "${code}":`, error);
//       return [code, {}];
//     }
//   })
// );

// const LANGUAGE_ORDER = Object.keys(LOCALE_REGISTRY);

// const SUPPORTED_LANGUAGES = LANGUAGE_ORDER.map((code) => ({
//   code,
//   label: LOCALE_REGISTRY[code].label,
//   nativeLabel: LOCALE_REGISTRY[code].nativeLabel,
// }));

// const LanguageContext = createContext(null);

// const LanguageProvider = ({ children }) => {
//   const router = useRouter();
//   const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     const savedLanguage = getItem('abyssinia_language', DEFAULT_LANGUAGE);
//     const isValidLanguage =
//       LANGUAGE_ORDER.includes(savedLanguage) &&
//       TRANSLATIONS[savedLanguage] &&
//       Object.keys(TRANSLATIONS[savedLanguage]).length > 0;

//     setLanguageState(isValidLanguage ? savedLanguage : DEFAULT_LANGUAGE);
//     setMounted(true);
//   }, []);

//   const t = useMemo(() => {
//     const active = TRANSLATIONS[language];
//     if (active && Object.keys(active).length > 0) return active;
//     return TRANSLATIONS[DEFAULT_LANGUAGE] || {};
//   }, [language]);

//   const toggleLanguage = useCallback(() => {
//     setLanguageState((prev) => {
//       const currentIndex = LANGUAGE_ORDER.indexOf(prev);
//       const nextIndex = (currentIndex + 1) % LANGUAGE_ORDER.length;
//       const nextLanguage = LANGUAGE_ORDER[nextIndex];
      
//       setItem('abyssinia_language', nextLanguage);
      
//       /* 
//        * Trigger a shallow client-side route refresh.
//        * This prevents full page reloads while forcing Next.js to 
//        * re-render the tree with the new translations.
//        */
//       if (router.isReady) {
//         router.replace(router.asPath, undefined, { scroll: false, shallow: true });
//       }
      
//       return nextLanguage;
//     });
//   }, [router]);

//   const setLanguage = useCallback((lang) => {
//     const isKnown = LANGUAGE_ORDER.includes(lang);
//     const isLoaded = isKnown && TRANSLATIONS[lang] && Object.keys(TRANSLATIONS[lang]).length > 0;
    
//     if (isLoaded && lang !== language) {
//       setLanguageState(lang);
//       setItem('abyssinia_language', lang);
      
//       /* Same shallow refresh for explicit language selection */
//       if (router.isReady) {
//         router.replace(router.asPath, undefined, { scroll: false, shallow: true });
//       }
//     }
//   }, [language, router]);

//   const value = useMemo(() => ({
//     language, 
//     t, 
//     toggleLanguage, 
//     setLanguage, 
//     mounted, 
//     supportedLanguages: SUPPORTED_LANGUAGES,
//   }), [language, t, toggleLanguage, setLanguage, mounted]);

//   return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
// };

// const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (context === null) {
//     return {
//       language: DEFAULT_LANGUAGE, 
//       t: TRANSLATIONS[DEFAULT_LANGUAGE] || {},
//       toggleLanguage: () => {}, 
//       setLanguage: () => {}, 
//       mounted: false,
//       supportedLanguages: SUPPORTED_LANGUAGES,
//     };
//   }
//   return context;
// };

// export { LanguageProvider, useLanguage, TRANSLATIONS, SUPPORTED_LANGUAGES, LANGUAGE_ORDER, DEFAULT_LANGUAGE };








// /**
//  * @fileoverview Language Context
//  *
//  * Multilingual EN/AM/TI/OM support. Every locale bundle is deep-merged
//  * over the English base so a missing key in any locale renders the
//  * English copy instead of a blank string. The locale's own admin
//  * namespace is overlaid last, making admin.godMode and every admin
//  * label deterministic regardless of aggregator ordering.
//  *
//  * Language switches use a shallow router replace so the tree re-renders
//  * with new copy without a full page reload or scroll jump.
//  *
//  * Path: apps/web/context/LanguageContext.js
//  */

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
// } from 'react';
// import { useRouter } from 'next/router';
// import { getItem, setItem } from '../lib/storage';

// const { deepMerge } = require('../../../packages/shared/config/i18n/merge');

// const DEFAULT_LANGUAGE = 'en';
// const LANGUAGE_STORAGE_KEY = 'abyssinia_language';

// /**
//  * Locale registry. `load` resolves the full namespace bundle; `admin`
//  * resolves the authoritative admin namespace directly from its source
//  * file so it can never be shadowed by another namespace.
//  */
// const LOCALE_REGISTRY = {
//   en: {
//     label: 'English',
//     nativeLabel: 'English',
//     load: () => require('../../../packages/shared/config/i18n/en'),
//     admin: () => require('../../../packages/shared/config/i18n/en/admin'),
//   },
//   am: {
//     label: 'Amharic',
//     nativeLabel: 'አማርኛ',
//     load: () => require('../../../packages/shared/config/i18n/am'),
//     admin: () => require('../../../packages/shared/config/i18n/am/admin'),
//   },
//   ti: {
//     label: 'Tigrinya',
//     nativeLabel: 'ትግርኛ',
//     load: () => require('../../../packages/shared/config/i18n/ti'),
//     admin: () => require('../../../packages/shared/config/i18n/ti/admin'),
//   },
//   om: {
//     label: 'Oromo',
//     nativeLabel: 'Afaan Oromoo',
//     load: () => require('../../../packages/shared/config/i18n/om'),
//     admin: () => require('../../../packages/shared/config/i18n/om/admin'),
//   },
// };

// /**
//  * Safely evaluate a locale loader, logging and degrading on failure.
//  * @param {Function} loader
//  * @param {string} code
//  * @returns {object}
//  */
// const safeLoad = (loader, code) => {
//   try {
//     const bundle = loader();
//     return bundle && typeof bundle === 'object' ? bundle : {};
//   } catch (error) {
//     console.error(`[i18n] Failed to load locale "${code}":`, error);
//     return {};
//   }
// };

// const ENGLISH_BASE = safeLoad(LOCALE_REGISTRY.en.load, 'en');

// /**
//  * Build every locale bundle: English base → locale bundle → locale
//  * admin namespace (authoritative). Inputs are never mutated.
//  */
// const TRANSLATIONS = Object.fromEntries(
//   Object.entries(LOCALE_REGISTRY).map(([code, { load, admin }]) => {
//     const localeBundle = safeLoad(load, code);
//     const adminNamespace = safeLoad(admin, code);
//     return [code, deepMerge(ENGLISH_BASE, localeBundle, adminNamespace)];
//   })
// );

// const LANGUAGE_ORDER = Object.keys(LOCALE_REGISTRY);

// const SUPPORTED_LANGUAGES = LANGUAGE_ORDER.map((code) => ({
//   code,
//   label: LOCALE_REGISTRY[code].label,
//   nativeLabel: LOCALE_REGISTRY[code].nativeLabel,
// }));

// const LanguageContext = createContext(null);

// const LanguageProvider = ({ children }) => {
//   const router = useRouter();
//   const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     const savedLanguage = getItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
//     const isValidLanguage =
//       LANGUAGE_ORDER.includes(savedLanguage) &&
//       TRANSLATIONS[savedLanguage] &&
//       Object.keys(TRANSLATIONS[savedLanguage]).length > 0;

//     setLanguageState(isValidLanguage ? savedLanguage : DEFAULT_LANGUAGE);
//     setMounted(true);
//   }, []);

//   const t = useMemo(() => {
//     const active = TRANSLATIONS[language];
//     if (active && Object.keys(active).length > 0) return active;
//     return TRANSLATIONS[DEFAULT_LANGUAGE] || {};
//   }, [language]);

//   /**
//    * Persist a language choice and refresh the route shallowly so the
//    * whole tree re-renders with the new copy without losing scroll.
//    * @param {string} nextLanguage
//    */
//   const applyLanguage = useCallback(
//     (nextLanguage) => {
//       setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
//       if (router.isReady) {
//         router.replace(router.asPath, undefined, {
//           scroll: false,
//           shallow: true,
//         });
//       }
//     },
//     [router]
//   );

//   const toggleLanguage = useCallback(() => {
//     setLanguageState((prev) => {
//       const currentIndex = LANGUAGE_ORDER.indexOf(prev);
//       const nextLanguage =
//         LANGUAGE_ORDER[(currentIndex + 1) % LANGUAGE_ORDER.length];
//       applyLanguage(nextLanguage);
//       return nextLanguage;
//     });
//   }, [applyLanguage]);

//   const setLanguage = useCallback(
//     (lang) => {
//       const isKnown = LANGUAGE_ORDER.includes(lang);
//       const isLoaded =
//         isKnown &&
//         TRANSLATIONS[lang] &&
//         Object.keys(TRANSLATIONS[lang]).length > 0;

//       if (isLoaded && lang !== language) {
//         setLanguageState(lang);
//         applyLanguage(lang);
//       }
//     },
//     [language, applyLanguage]
//   );

//   const value = useMemo(
//     () => ({
//       language,
//       t,
//       toggleLanguage,
//       setLanguage,
//       mounted,
//       supportedLanguages: SUPPORTED_LANGUAGES,
//     }),
//     [language, t, toggleLanguage, setLanguage, mounted]
//   );

//   return (
//     <LanguageContext.Provider value={value}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };

// /**
//  * Consume the language context. Outside a provider, returns the English
//  * bundle with inert mutators so isolated renders never crash.
//  */
// const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (context === null) {
//     return {
//       language: DEFAULT_LANGUAGE,
//       t: TRANSLATIONS[DEFAULT_LANGUAGE] || {},
//       toggleLanguage: () => {},
//       setLanguage: () => {},
//       mounted: false,
//       supportedLanguages: SUPPORTED_LANGUAGES,
//     };
//   }
//   return context;
// };

// export {
//   LanguageProvider,
//   useLanguage,
//   TRANSLATIONS,
//   SUPPORTED_LANGUAGES,
//   LANGUAGE_ORDER,
//   DEFAULT_LANGUAGE,
// };







/**
 * @fileoverview Language Context
 *
 * Multilingual EN/AM/TI/OM support. Every locale bundle is deep-merged
 * over the English base so a missing key in any locale renders the
 * English copy instead of a blank string. The locale's own admin
 * namespace is overlaid last, making admin.godMode and every admin
 * label deterministic regardless of aggregator ordering.
 *
 * Language switches use a shallow router replace so the tree re-renders
 * with new copy without a full page reload or scroll jump.
 *
 * Path: apps/web/context/LanguageContext.js
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { getItem, setItem } from '../lib/storage';

const { deepMerge } = require('../../../packages/shared/config/i18n/merge');

const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'abyssinia_language';

/**
 * Locale registry. `load` resolves the full namespace bundle; `admin`
 * resolves the authoritative admin namespace directly from its source
 * file so it can never be shadowed by another namespace.
 */
const LOCALE_REGISTRY = {
  en: {
    label: 'English',
    nativeLabel: 'English',
    load: () => require('../../../packages/shared/config/i18n/en'),
    admin: () => require('../../../packages/shared/config/i18n/en/admin'),
  },
  am: {
    label: 'Amharic',
    nativeLabel: 'አማርኛ',
    load: () => require('../../../packages/shared/config/i18n/am'),
    admin: () => require('../../../packages/shared/config/i18n/am/admin'),
  },
  ti: {
    label: 'Tigrinya',
    nativeLabel: 'ትግርኛ',
    load: () => require('../../../packages/shared/config/i18n/ti'),
    admin: () => require('../../../packages/shared/config/i18n/ti/admin'),
  },
  om: {
    label: 'Oromo',
    nativeLabel: 'Afaan Oromoo',
    load: () => require('../../../packages/shared/config/i18n/om'),
    admin: () => require('../../../packages/shared/config/i18n/om/admin'),
  },
};

/**
 * Safely evaluate a locale loader, logging and degrading on failure.
 * @param {Function} loader
 * @param {string} code
 * @returns {object}
 */
const safeLoad = (loader, code) => {
  try {
    const bundle = loader();
    return bundle && typeof bundle === 'object' ? bundle : {};
  } catch (error) {
    console.error(`[i18n] Failed to load locale "${code}":`, error);
    return {};
  }
};

const ENGLISH_BASE = safeLoad(LOCALE_REGISTRY.en.load, 'en');

/**
 * Build every locale bundle: English base → locale bundle → locale
 * admin namespace (authoritative). Inputs are never mutated.
 */
const TRANSLATIONS = Object.fromEntries(
  Object.entries(LOCALE_REGISTRY).map(([code, { load, admin }]) => {
    const localeBundle = safeLoad(load, code);
    const adminNamespace = safeLoad(admin, code);
    return [code, deepMerge(ENGLISH_BASE, localeBundle, adminNamespace)];
  })
);

const LANGUAGE_ORDER = Object.keys(LOCALE_REGISTRY);

const SUPPORTED_LANGUAGES = LANGUAGE_ORDER.map((code) => ({
  code,
  label: LOCALE_REGISTRY[code].label,
  nativeLabel: LOCALE_REGISTRY[code].nativeLabel,
}));

const LanguageContext = createContext(null);

const LanguageProvider = ({ children }) => {
  const router = useRouter();
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = getItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
    const isValidLanguage =
      LANGUAGE_ORDER.includes(savedLanguage) &&
      TRANSLATIONS[savedLanguage] &&
      Object.keys(TRANSLATIONS[savedLanguage]).length > 0;

    setLanguageState(isValidLanguage ? savedLanguage : DEFAULT_LANGUAGE);
    setMounted(true);
  }, []);

  const t = useMemo(() => {
    const active = TRANSLATIONS[language];
    if (active && Object.keys(active).length > 0) return active;
    return TRANSLATIONS[DEFAULT_LANGUAGE] || {};
  }, [language]);

  /**
   * Persist a language choice and refresh the route shallowly so the
   * whole tree re-renders with the new copy without losing scroll.
   * @param {string} nextLanguage
   */
  const applyLanguage = useCallback(
    (nextLanguage) => {
      setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      if (router.isReady) {
        router.replace(router.asPath, undefined, {
          scroll: false,
          shallow: true,
        });
      }
    },
    [router]
  );

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const currentIndex = LANGUAGE_ORDER.indexOf(prev);
      const nextLanguage =
        LANGUAGE_ORDER[(currentIndex + 1) % LANGUAGE_ORDER.length];
      applyLanguage(nextLanguage);
      return nextLanguage;
    });
  }, [applyLanguage]);

  const setLanguage = useCallback(
    (lang) => {
      const isKnown = LANGUAGE_ORDER.includes(lang);
      const isLoaded =
        isKnown &&
        TRANSLATIONS[lang] &&
        Object.keys(TRANSLATIONS[lang]).length > 0;

      if (isLoaded && lang !== language) {
        setLanguageState(lang);
        applyLanguage(lang);
      }
    },
    [language, applyLanguage]
  );

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
 * Consume the language context. Outside a provider, returns the English
 * bundle with inert mutators so isolated renders never crash.
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