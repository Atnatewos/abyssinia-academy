/**
 * @fileoverview Internationalization Configuration
 * Aggregates all language translations
 * Path: packages/shared/config/i18n/index.js
 */

const en = require('./en.config');
const am = require('./am.config');
const ti = require('./ti.config');
const om = require('./om.config');

const i18n = {
  defaultLanguage: 'en',

  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
    { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
  ],

  translations: {
    en,
    am,
    ti,
    om,
  },

  getTranslations(lang) {
    return this.translations[lang] || this.translations[this.defaultLanguage];
  },
};

module.exports = i18n;