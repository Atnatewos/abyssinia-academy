/**
 * @fileoverview Week 22: Project Week 2 - Amazon Clone (Frontend)
 * Phase 4 - The Project Phase: Building Fullstack Applications
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-22.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_22 = {
  number: 22,
  phaseNumber: 4,
  title: 'Project Week 2: Amazon Clone (Frontend)',
  lessons: [
    createLesson({
      id: 'p4-w22-l1',
      title: 'Amazon Clone (Frontend)',
      isFreePreview: false,
      notes: 'Build the frontend of an Amazon clone. Master React Router, Context API, useReducer, and complex state management for a shopping cart.',
    //   mainVideo: mainVideo(
    //     'Full Project Build: Amazon Clone Frontend',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Header component', 'PLACEHOLDER_YOUTUBE_ID', '14:00'),
        sessionVideo('1.3 - Carousel effect', 'PLACEHOLDER_YOUTUBE_ID', '37:00'),
        sessionVideo('1.4 - Category', 'PLACEHOLDER_YOUTUBE_ID', '46:00'),
        sessionVideo('1.5 - Single product component', 'PLACEHOLDER_YOUTUBE_ID', '56:00'),
        sessionVideo('1.6 - Header routing', 'PLACEHOLDER_YOUTUBE_ID', '01:19:00'),
        sessionVideo('1.7 - Category routing', 'PLACEHOLDER_YOUTUBE_ID', '01:30:00'),
        sessionVideo('1.8 - Detail page routing', 'PLACEHOLDER_YOUTUBE_ID', '01:41:00'),
        sessionVideo('1.9 - Loading functionality integration', 'PLACEHOLDER_YOUTUBE_ID', '01:48:00'),
        sessionVideo('1.10 - Detail page styling and addition of description on single product', 'PLACEHOLDER_YOUTUBE_ID', '01:59:00'),
        sessionVideo('1.11 - useReducer Hook and UseContextAPI explanation and example', 'PLACEHOLDER_YOUTUBE_ID', '02:06:00'),
        sessionVideo('1.12 - Add to cart functionality', 'PLACEHOLDER_YOUTUBE_ID', '02:26:00'),
        sessionVideo('1.13 - Header sticky part implementation', 'PLACEHOLDER_YOUTUBE_ID', '02:47:00'),
        sessionVideo('1.14 - Cart page - Part one', 'PLACEHOLDER_YOUTUBE_ID', '02:49:00'),
        sessionVideo('1.15 - Cart page - Part two', 'PLACEHOLDER_YOUTUBE_ID', '03:06:00'),
        sessionVideo('1.16 - Cart page - Part three', 'PLACEHOLDER_YOUTUBE_ID', '03:13:00'),
      ],
      resources: [
        resource('Amazon_Frontend_Starter.zip', 'zip'),
      ],
    }),
  ],
};

module.exports = WEEK_22;