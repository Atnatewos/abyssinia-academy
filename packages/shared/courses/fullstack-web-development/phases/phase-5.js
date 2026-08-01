const allWeeks = require('../weeks');
const weekNumbers = Object.values(allWeeks).filter((w) => w.phaseNumber === 5).map((w) => w.number).sort((a, b) => a - b);
const PHASE_5 = {
  id: 'phase-5', number: 5,
  title: 'Full-Stack Next.js, Cloud DevOps & Capstone',
  subtitle: 'Next.js App Router, SSR, Docker & Cloud Deployment',
  description: 'Unify frontend and backend into Next.js apps.',
  color: 'from-amber-400 to-yellow-600', duration: '4 Weeks', icon: 'Trophy',
  outcomes: ['Next.js App Router', 'Docker & CI/CD', 'Cloud Deployment'],
  weekNumbers: weekNumbers,
};
module.exports = PHASE_5;