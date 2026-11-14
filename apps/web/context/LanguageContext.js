/**
 * @fileoverview Language Context
 * Multilingual EN/AM/TI/OM support with translations loaded from shared i18n
 * config files.
 *
 * Uses Next.js router for client-side transitions to prevent hydration
 * mismatches and full-page reloads when the language is toggled.
 *
 * Path: apps/web/context/LanguageContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { getItem, setItem } from '../lib/storage';

const LOCALE_REGISTRY = {
  en: { label: 'English', nativeLabel: 'English', load: () => require('../../../packages/shared/config/i18n/en') },
  am: { label: 'Amharic', nativeLabel: 'አማርኛ', load: () => require('../../../packages/shared/config/i18n/am') },
  ti: { label: 'Tigrinya', nativeLabel: 'ትግርኛ', load: () => require('../../../packages/shared/config/i18n/ti') },
  om: { label: 'Oromo', nativeLabel: 'Afaan Oromoo', load: () => require('../../../packages/shared/config/i18n/om') },
};

const DEFAULT_LANGUAGE = 'en';

const TRANSLATIONS = Object.fromEntries(
  Object.entries(LOCALE_REGISTRY).map(([code, { load }]) => {
    try {
      return [code, load()];
    } catch (error) {
      console.error(`[i18n] Failed to load locale "${code}":`, error);
      return [code, {}];
    }
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
    const savedLanguage = getItem('abyssinia_language', DEFAULT_LANGUAGE);
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

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const currentIndex = LANGUAGE_ORDER.indexOf(prev);
      const nextIndex = (currentIndex + 1) % LANGUAGE_ORDER.length;
      const nextLanguage = LANGUAGE_ORDER[nextIndex];
      
      setItem('abyssinia_language', nextLanguage);
      
      /* 
       * Trigger a shallow client-side route refresh.
       * This prevents full page reloads while forcing Next.js to 
       * re-render the tree with the new translations.
       */
      if (router.isReady) {
        router.replace(router.asPath, undefined, { scroll: false, shallow: true });
      }
      
      return nextLanguage;
    });
  }, [router]);

  const setLanguage = useCallback((lang) => {
    const isKnown = LANGUAGE_ORDER.includes(lang);
    const isLoaded = isKnown && TRANSLATIONS[lang] && Object.keys(TRANSLATIONS[lang]).length > 0;
    
    if (isLoaded && lang !== language) {
      setLanguageState(lang);
      setItem('abyssinia_language', lang);
      
      /* Same shallow refresh for explicit language selection */
      if (router.isReady) {
        router.replace(router.asPath, undefined, { scroll: false, shallow: true });
      }
    }
  }, [language, router]);

  const value = useMemo(() => ({
    language, 
    t, 
    toggleLanguage, 
    setLanguage, 
    mounted, 
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [language, t, toggleLanguage, setLanguage, mounted]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

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

export { LanguageProvider, useLanguage, TRANSLATIONS, SUPPORTED_LANGUAGES, LANGUAGE_ORDER, DEFAULT_LANGUAGE };






// /**
//  * @fileoverview Language Context
//  * 
//  * AUTO-DETECTS LANGUAGES
//  * This file uses Webpack's `require.context` to automatically load 
//  * every `.config.js` file in the i18n directory. 
//  * 
//  * TO ADD A NEW LANGUAGE:
//  *   1. Create `packages/shared/config/i18n/[code].config.js`
//  *   2. Export an object with: `{ code, name, nativeName, ...translations }`
//  *   3. That's it. The app will auto-detect it, add it to the toggle, 
//  *      and load the translations.
//  *
//  * Path: apps/web/context/LanguageContext.js
//  */

// import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
// import { useRouter } from 'next/router';
// import { getItem, setItem } from '../lib/storage';

// const DEFAULT_LANGUAGE = 'en';

// /* 
//  * AUTO-DISCOVERY: 
//  * This tells Webpack to look inside the i18n directory and grab all
//  * `.config.js` files. It ignores `index.js` and any config maps.
//  */
// const i18nContext = require.context(
//   '../../../packages/shared/config/i18n', 
//   false, 
//   /\.config\.js$/
// );

// /* Build the registry and translations dynamically */
// const LOCALE_REGISTRY = {};
// const TRANSLATIONS = {};

// i18nContext.keys().forEach((key) => {
//   try {
//     const module = i18nContext(key);
//     const config = module.default || module;

//     /* 
//      * We use the `code` from inside the file. 
//      * If it's missing, we fallback to the filename (e.g. 'fr' from 'fr.config.js')
//      */
//     const code = config.code || key.replace('./', '').replace('.config.js', '');
    
//     if (code && config) {
//       LOCALE_REGISTRY[code] = {
//         label: config.name || code.toUpperCase(),
//         nativeLabel: config.nativeName || config.name || code.toUpperCase(),
//       };
//       TRANSLATIONS[code] = config;
//     }
//   } catch (error) {
//     console.error(`[i18n] Failed to load locale file: ${key}`, error);
//   }
// });

// /* 
//  * Fallback safety net if no files are found.
//  * Ensures the app never fully crashes on a missing translation folder.
//  */
// if (Object.keys(TRANSLATIONS).length === 0) {
//   console.warn('[i18n] No locale files found. Falling back to empty English.');
//   TRANSLATIONS[DEFAULT_LANGUAGE] = {};
//   LOCALE_REGISTRY[DEFAULT_LANGUAGE] = { label: 'English', nativeLabel: 'English' };
// }

// /* Sort languages alphabetically by their native label for the dropdown */
// const LANGUAGE_ORDER = Object.keys(LOCALE_REGISTRY).sort((a, b) => {
//   if (a === DEFAULT_LANGUAGE) return -1;
//   if (b === DEFAULT_LANGUAGE) return 1;
//   return LOCALE_REGISTRY[a].nativeLabel.localeCompare(LOCALE_REGISTRY[b].nativeLabel);
// });

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
    
//     /* Validate against dynamically loaded languages */
//     const isValidLanguage =
//       LANGUAGE_ORDER.includes(savedLanguage) &&
//       TRANSLATIONS[savedLanguage] &&
//       Object.keys(TRANSLATIONS[savedLanguage]).length > 0;

//     setLanguageState(isValidLanguage ? savedLanguage : DEFAULT_LANGUAGE);
//     setMounted(true);
//   }, []);

//   /* Memoized translations object */
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
      
//       /* Instant client-side swap without losing scroll position */
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