/**
 * @fileoverview Week 5: Responsive Website Development - Media Queries
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-05.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_05 = {
  number: 5,
  phaseNumber: 1,
  title: 'Responsive Website Development',

  lessons: [

    createLesson({
      id: 'p1-w5-l1',
      title: 'Responsive website development - media queries',
      isFreePreview: false,
      notes: 'Learn how to make your websites look perfect on every screen size.',
      mainVideo: mainVideo(
        'Responsive website development - media queries',
        'https://www.youtube.com/watch?v=iHYbAiR7-KI'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Responsive website and what is media query', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
        sessionVideo('1.2 - Break points', 'PLACEHOLDER_YOUTUBE_ID', '08:00'),
        sessionVideo('1.3 - Defining breakpoints for screen sizes', 'PLACEHOLDER_YOUTUBE_ID', '08:00'),
        sessionVideo('1.4 - The mobile first development approach', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
        sessionVideo('1.5 - Building the Puppy Lovers Page using media query', 'PLACEHOLDER_YOUTUBE_ID', '29:00'),
      ],
      resources: [
        resource('Media_Queries_Guide.pdf', 'pdf'),
      ],
    }),

      createLesson({
      id: 'p1-w5-l2',
      title: 'Media Queries - Demo',
      isFreePreview: false,
      notes: 'Learn how to make your websites look perfect on every screen size.',
      mainVideo: mainVideo(
        'Media Queries Demo',
        'https://www.youtube.com/watch?v=btGPBzL2Cm4'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Media Query Demo (Mobile first)', 'https://www.youtube.com/watch?v=rF2_3XrmPPo', '30:46'),
        sessionVideo('2.2 - Media Query Demo (adding media query)', 'https://www.youtube.com/watch?v=UjvZZR_w6W8', '19:11'),
      ],
      resources: [
        resource('Media_Queries_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_05;