/**
 * @fileoverview Week 4: Project - Rebuilding Apple.com's Homepage
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-04.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_04 = {
  number: 4,
  phaseNumber: 1,
  title: 'Project - Rebuilding Apple.com',

  lessons: [

    createLesson({
      id: 'p1-w4-l1',
      title: 'Rebuilding Apple.com\'s homepage using HTML & CSS',
      isFreePreview: false,
      notes: 'Apply everything you have learned by rebuilding a professional website from scratch.',
      mainVideo: mainVideo(
        'Rebuilding Apple.com\'s homepage using HTML & CSS',
        'https://www.youtube.com/watch?v=ED7w3dmtV6E'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction', 'PLACEHOLDER_YOUTUBE_ID', '05:00'),
        sessionVideo('1.2 - Website, application and software development life cycle (SDLC)', 'PLACEHOLDER_YOUTUBE_ID', '17:00'),
        sessionVideo('1.3 - Website development phase', 'PLACEHOLDER_YOUTUBE_ID', '30:00'),
        sessionVideo('1.4 - Steps needed to take before building any website', 'PLACEHOLDER_YOUTUBE_ID', '32:00'),
      ],
      resources: [
        resource('Apple_Project_Assets.zip', 'zip'),
      ],
    }),

    createLesson({
      id: 'p1-w4-l2',
      title: 'Introduction to UX/UI design',
      isFreePreview: false,
      notes: 'Understand the principles of user experience and user interface design.',
      mainVideo: mainVideo(
        'Introduction to UX/UI design',
        'https://www.youtube.com/watch?v=DdHhc-EQoOY'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Why do businesses need a website and what is attention trading?', 'PLACEHOLDER_YOUTUBE_ID', '22:00'),
        sessionVideo('2.2 - Web design (UX and UI design)', 'PLACEHOLDER_YOUTUBE_ID', '10:00'),
        sessionVideo('2.3 - Web design psychology', 'PLACEHOLDER_YOUTUBE_ID', '08:00'),
        sessionVideo('2.4 - What do web designers design?', 'PLACEHOLDER_YOUTUBE_ID', '06:00'),
        sessionVideo('2.5 - Essential photoshop skills as a web developer', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
      ],
      resources: [
        resource('UX_UI_Design_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_04;