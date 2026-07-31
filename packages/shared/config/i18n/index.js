/**
 * @fileoverview Internationalization Configuration
 * Aggregates all language translations
 * Path: packages/shared/config/i18n/index.js
 */

const en = require('./en.config');
const am = require('./am.config');

const i18n = {
  defaultLanguage: 'en',

  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  ],

  translations: {
    en,
    am,
  },

  getTranslations(lang) {
    return this.translations[lang] || this.translations[this.defaultLanguage];
  },
};

module.exports = i18n;