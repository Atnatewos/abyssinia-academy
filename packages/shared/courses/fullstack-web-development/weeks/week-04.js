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
        sessionVideo('1.1 - Introduction', 'https://www.youtube.com/watch?v=PimsHXLOKMI', '05:00'),
        sessionVideo('1.2 - Website, application and software development life cycle (SDLC)', 'https://www.youtube.com/watch?v=419c3VNjaTQ', '17:00'),
        sessionVideo('1.3 - Website development phase', 'https://www.youtube.com/watch?v=ytdY6C8TY84', '30:00'),
        sessionVideo('1.4 - Steps needed to take before building any website', 'https://www.youtube.com/watch?v=rXJr4jdTwQw', '32:00'),
      ],
      resources: [
        resource('Apple_Project_Assets.zip', 'zip'),
      ],
    }),

        createLesson({
      id: 'p1-w4-l1',
      title: 'Re-building Apple\'s Website Step-by-Step Guide',
      isFreePreview: false,
      notes: 'Apply everything you have learned by rebuilding a professional website from scratch.',
      // mainVideo: mainVideo(
      //   'Rebuilding Apple.com\'s homepage using HTML & CSS',
      //   'https://www.youtube.com/watch?v=ED7w3dmtV6E'
      // ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction', 'https://www.youtube.com/watch?v=cWqmE5sc_cU', '01:22:55'),
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
        sessionVideo('2.1 - Why do businesses need a website and what is attention trading?', 'https://www.youtube.com/watch?v=Tzn8sQJyA2g', '22:00'),
        sessionVideo('2.2 - Web design (UX and UI design)', 'https://www.youtube.com/watch?v=-oWpOZiUtZY', '10:00'),
        sessionVideo('2.3 - Web design psychology', 'https://www.youtube.com/watch?v=zW1bw3DkUwU', '08:00'),
        sessionVideo('2.4 - What do web designers design?', 'https://www.youtube.com/watch?v=dVLvkxOJFQQ', '06:00'),
        sessionVideo('2.5 - Essential photoshop skills as a web developer', 'https://www.youtube.com/watch?v=0eAcGp08v3g', '16:00'),
      ],
      resources: [
        resource('UX_UI_Design_Guide.pdf', 'pdf'),
      ],
    }),

        createLesson({
      id: 'p1-w4-l2',
      title: 'Suggested video to watch',
      isFreePreview: false,
      notes: 'Understand the principles of user experience and user interface design.',
      // mainVideo: mainVideo(
      //   'Introduction to UX/UI design',
      //   'https://www.youtube.com/watch?v=DdHhc-EQoOY'
      // ),
      sessionVideos: [
        sessionVideo('Photoshop tutorial', 'https://www.youtube.com/watch?v=pFyOznL9UvA', '36:56'),

      ],
      resources: [
        resource('UX_UI_Design_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_04;