/**
 * @fileoverview Phase 1 - Auto-detects all weeks that belong to this phase
 * No need to manually add weekNumbers. Just create week-XX.js with phaseNumber: 1
 * Path: packages/shared/courses/fullstack-web-development/phases/phase-1.js
 */

const allWeeks = require('../weeks');

/**
 * Auto-detect which weeks belong to this phase by checking week.phaseNumber
 * Just create a week file with `phaseNumber: 1` and it appears automatically
 */
const weekNumbers = Object.values(allWeeks)
  .filter((week) => week.phaseNumber === 1)
  .map((week) => week.number)
  .sort((a, b) => a - b);

const PHASE_1 = {
  id: 'phase-1',
  number: 1,
  title: 'Building static websites using HTML, CSS & Bootstrap',
  subtitle: 'HTML5, CSS3, Modern UI/UX Layouts & Git Enterprise Workflow',
  description: 'Build an unshakeable foundation in semantic HTML5, fluid layouts, modern Flexbox and Grid, mobile responsiveness, and collaborative Git version control.',
  color: 'from-amber-500 to-yellow-400',
  duration: '4 Weeks',
  icon: 'Code2',
  outcomes: [
    'Semantic HTML5 & Web Accessibility (a11y)',
    'Responsive CSS Flexbox & Multi-dimensional CSS Grid',
    'Professional Git branching, pull requests, and GitHub workflows',
  ],
  weekNumbers: weekNumbers,
};

module.exports = PHASE_1;