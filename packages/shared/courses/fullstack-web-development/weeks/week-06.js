/**
 * @fileoverview Week 6: Responsive Web Design & CSS Architecture
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-06.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_06 = {
  number: 6,
  phaseNumber: 1,
  title: 'Week 6: Responsive Web Design & CSS Architecture',

  lessons: [

    createLesson({
      id: 'p1-w6-l1',
      title: 'Mobile-First Design & Media Queries',
      isFreePreview: false,
      notes: 'Build websites that look perfect on every screen size from mobile to desktop.',
      mainVideo: mainVideo(
        'Responsive Web Design Masterclass',
        'https://www.youtube.com/watch?v=2KL-z9UZ6gQ'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Understanding Viewport & Breakpoints', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '00:00'),
        sessionVideo('1.2 - Media Queries Deep Dive', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '16:00'),
        sessionVideo('1.3 - Fluid Typography & Spacing', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '30:00'),
      ],
      resources: [
        resource('Responsive_Design_Checklist.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w6-l2',
      title: 'CSS Architecture & Best Practices',
      isFreePreview: false,
      notes: 'Learn how to organize CSS at scale using modern methodologies.',
      mainVideo: mainVideo(
        'CSS Architecture Patterns',
        'https://www.youtube.com/watch?v=2KL-z9UZ6gQ'
      ),
      sessionVideos: [
        sessionVideo('2.1 - CSS Naming Conventions (BEM)', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '00:00'),
        sessionVideo('2.2 - CSS Custom Properties & Variables', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '18:00'),
        sessionVideo('2.3 - Building a Design System', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '35:00'),
      ],
      resources: [
        resource('CSS_Architecture_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_06;