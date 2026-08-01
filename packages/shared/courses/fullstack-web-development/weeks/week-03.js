/**
 * @fileoverview Week 3: Git Enterprise Workflow
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-03.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_03 = {
  number: 3, phaseNumber: 1,
  title: 'Git Enterprise Workflow & Version Control',
  lessons: [
    createLesson({
      id: 'p1-w3-l1',
      title: 'Git Fundamentals: Commits, Branches & Merges',
      duration: '45 mins',
      notes: 'Essential Git for collaborative software development.',
      mainVideo: mainVideo('Full Lecture: Git Fundamentals', 'https://www.youtube.com/watch?v=RGOj5yH7evk'),
      sessionVideos: [
        sessionVideo('01. Init, Add, Commit Lifecycle', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '00:00'),
        sessionVideo('02. Branching Strategies Explained', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '18:00'),
        sessionVideo('03. Merge vs Rebase', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '32:00'),
      ],
      resources: [resource('Git_CheatSheet.pdf', 'pdf')],
    }),
  ],
};

module.exports = WEEK_03;