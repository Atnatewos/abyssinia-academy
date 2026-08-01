const allWeeks = require('../weeks');
const weekNumbers = Object.values(allWeeks).filter((w) => w.phaseNumber === 3).map((w) => w.number).sort((a, b) => a - b);
const PHASE_3 = {
  id: 'phase-3', number: 3,
  title: 'Frontend Mastery with React & State Engines',
  subtitle: 'Component Architecture, Virtual DOM, Hooks, Context',
  description: 'Construct fast, reactive SPAs with React 18.',
  color: 'from-amber-500 to-orange-400', duration: '4 Weeks', icon: 'Layers',
  outcomes: ['Virtual DOM & Reconciliation', 'Hooks & Custom Hooks', 'State Management'],
  weekNumbers: weekNumbers,
};
module.exports = PHASE_3;