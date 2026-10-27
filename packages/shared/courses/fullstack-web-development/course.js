/**
 * @fileoverview Full-Stack Web Development Course
 * Path: packages/shared/courses/fullstack-web-development/course.js
 */

const allPhases = require('./phases');
const allWeeks = require('./weeks');

const phases = allPhases.map((phase) => ({
  ...phase,
  weeks: phase.weekNumbers.map((num) => allWeeks[num]).filter(Boolean),
}));

const COURSE = {
  id: 'course-fullstack-mastery',
  slug: 'fullstack-web-engineering-masterclass',
  title: 'Full-Stack Web Engineering Masterclass',
  description: 'Complete roadmap to master modern frontend, robust Node.js backend architectures, databases, Next.js, and cloud deployments.',
  meta: {
    level: 'Beginner to Advanced',
    duration: '20+ Weeks',
    totalPhases: 5,
    badge: 'Most Popular',
    icon: 'Code2',
    isPublished: true,
  },
  phases,
};

module.exports = COURSE;