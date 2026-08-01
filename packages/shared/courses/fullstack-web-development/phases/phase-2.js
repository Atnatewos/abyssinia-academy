/**
 * @fileoverview Phase 2 - Auto-detects weeks with phaseNumber: 2
 * Path: packages/shared/courses/fullstack-web-development/phases/phase-2.js
 */

const allWeeks = require('../weeks');

const weekNumbers = Object.values(allWeeks)
  .filter((week) => week.phaseNumber === 2)
  .map((week) => week.number)
  .sort((a, b) => a - b);

const PHASE_2 = {
  id: 'phase-2', number: 2,
  title: 'Advanced JavaScript (ES6+) & Asynchronous Engine',
  subtitle: 'Execution Context, Call Stack, Closures, Promises & Async/Await',
  description: 'Master the fundamental engine powering modern web apps.',
  color: 'from-amber-400 to-yellow-500', duration: '4 Weeks', icon: 'Terminal',
  outcomes: ['V8 Engine Mechanics', 'Async JS & Event Loop', 'ES6+ Features'],
  weekNumbers: weekNumbers,
};
module.exports = PHASE_2;