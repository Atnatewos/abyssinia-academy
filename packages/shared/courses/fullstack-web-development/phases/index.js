/**
 * @fileoverview Phase Aggregator
 * Exports all 5 phases in order.
 *
 * Each phase file is self-describing — it declares its `number`, title,
 * description, outcomes, and `weekNumbers` (or auto-detects them from
 * the weeks directory for phase 1).
 *
 * Path: packages/shared/courses/fullstack-web-development/phases/index.js
 */

const PHASES = [
  require('./phase-1'),
  require('./phase-2'),
  require('./phase-3'),
  require('./phase-4'),
  require('./phase-5'),
];

module.exports = PHASES;