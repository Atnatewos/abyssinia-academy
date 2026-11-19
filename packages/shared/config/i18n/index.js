// /**
//  * @fileoverview Internationalization Configuration
//  * Aggregates all language translations
//  * Path: packages/shared/config/i18n/index.js
//  */

// const en = require('./en.config');
// const am = require('./am.config');
// const ti = require('./ti.config');
// const om = require('./om.config');

// const i18n = {
//   defaultLanguage: 'en',

//   supportedLanguages: [
//     { code: 'en', name: 'English', nativeName: 'English' },
//     { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
//     { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
//     { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
//   ],

//   translations: {
//     en,
//     am,
//     ti,
//     om,
//   },

//   getTranslations(lang) {
//     return this.translations[lang] || this.translations[this.defaultLanguage];
//   },
// };

// module.exports = i18n;








/**
 * @fileoverview Internationalization Configuration
 *
 * Single entry point for every translation consumer (frontend context,
 * server handlers, scripts). Loads the namespace-folder aggregators —
 * the authoritative bundles — so admin.godMode and every other modern
 * namespace is always present.
 *
 * Path: packages/shared/config/i18n/index.js
 */

'use strict';

const en = require('./en');
const am = require('./am');
const ti = require('./ti');
const om = require('./om');

const i18n = {
  defaultLanguage: 'en',
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
    { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
  ],
  translations: { en, am, ti, om },

  /**
   * Resolve a translation bundle, falling back to the default language.
   * @param {string} lang - Language code
   * @returns {object} Translation bundle
   */
  getTranslations(lang) {
    return this.translations[lang] || this.translations[this.defaultLanguage];
  },
};

module.exports = i18n;