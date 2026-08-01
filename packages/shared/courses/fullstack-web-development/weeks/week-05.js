/**
 * @fileoverview Week 5: Git & Version Control Fundamentals
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-05.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_05 = {
  number: 5,
  phaseNumber: 1,
  title: 'Week 5: Git & Version Control Fundamentals',

  lessons: [

    createLesson({
      id: 'p1-w5-l1',
      title: 'Introduction to Git & GitHub',
      isFreePreview: false,
      notes: 'Learn the fundamentals of version control with Git and how to collaborate using GitHub.',
      mainVideo: mainVideo(
        'Git & GitHub for Beginners',
        'https://www.youtube.com/watch?v=RGOj5yH7evk'
      ),
      sessionVideos: [
        sessionVideo('1.1 - What is Version Control?', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '00:00'),
        sessionVideo('1.2 - Installing Git & First Repository', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '12:00'),
        sessionVideo('1.3 - Staging, Committing & Pushing', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '25:00'),
      ],
      resources: [
        resource('Git_CheatSheet.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w5-l2',
      title: 'Branching, Merging & Pull Requests',
      isFreePreview: false,
      notes: 'Master the Git workflow used by professional development teams worldwide.',
      mainVideo: mainVideo(
        'Git Branching & Collaboration',
        'https://www.youtube.com/watch?v=RGOj5yH7evk'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Creating & Switching Branches', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '00:00'),
        sessionVideo('2.2 - Merging & Resolving Conflicts', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '15:00'),
        sessionVideo('2.3 - Pull Requests & Code Review', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '28:00'),
      ],
      resources: [
        resource('Git_Workflow_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_05;