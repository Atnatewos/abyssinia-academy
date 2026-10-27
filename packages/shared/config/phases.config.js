/**
 * @fileoverview Phase Purchase Configuration
 * Controls which phases can be purchased individually, prerequisites, and pricing display
 * All display text lives in i18n files — this is structure only
 * Path: packages/shared/config/phases.config.js
 */

const phasesPurchaseConfig = {
  /*
   * Master switch — set to false to force full-course-only purchases
   */
  individuallyPurchasable: true,

  /*
   * Phase definitions for the purchase flow
   * id must match the phase id from courses/fullstack-web-development/phases/
   * prerequisites prevent selection of advanced phases without foundations
   */
  phases: [
    {
      id: 'phase-1',
      number: 1,
      prerequisites: [],
      orderIndex: 1,
    },
    {
      id: 'phase-2',
      number: 2,
      prerequisites: [],
      orderIndex: 2,
    },
    {
      id: 'phase-3',
      number: 3,
      prerequisites: ['phase-2'],
      orderIndex: 3,
    },
    {
      id: 'phase-4',
      number: 4,
      prerequisites: ['phase-2'],
      orderIndex: 4,
    },
    {
      id: 'phase-5',
      number: 5,
      prerequisites: ['phase-3', 'phase-4'],
      orderIndex: 5,
    },
  ],
};

module.exports = phasesPurchaseConfig;