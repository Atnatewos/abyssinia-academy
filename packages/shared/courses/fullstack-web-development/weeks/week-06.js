/**
 * @fileoverview Week 6: Bootstrap
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-06.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_06 = {
  number: 6,
  phaseNumber: 1,
  title: 'Bootstrap',

  lessons: [

    createLesson({
      id: 'p1-w6-l1',
      title: 'Responsive website development: Bootstrap',
      isFreePreview: false,
      notes: 'Learn the most popular CSS framework used by millions of developers worldwide.',
      mainVideo: mainVideo(
        'Responsive website development: Bootstrap',
        'https://www.youtube.com/watch?v=l3Zd5WvIpg4'
      ),
      sessionVideos: [
        sessionVideo('1.1 - What is Bootstrap?', 'https://www.youtube.com/watch?v=5kd1lSSjEU8', '14:00'),
        sessionVideo('1.2 - How do we use Bootstrap?', 'https://www.youtube.com/watch?v=sCnXDO3lOZU', '08:00'),
        sessionVideo('1.3 - Bootstrap containers', 'https://www.youtube.com/watch?v=mXsmXcq7c6A', '10:00'),
        sessionVideo('1.4 - Bootstrap breakpoints', 'https://www.youtube.com/watch?v=TBl3v5HZo90', '04:00'),
        sessionVideo('1.5 - Bootstrap grid system (rows)', 'https://www.youtube.com/watch?v=ouD44sWtqqU', '16:00'),
        sessionVideo('1.6 - Bootstrap grid system (columns)', 'https://www.youtube.com/watch?v=ykMiGvNF4bU', '21:00'),
      ],
      resources: [
        resource('Bootstrap_CheatSheet.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w6-l2',
      title: 'Bootstrap - Demo',
      isFreePreview: false,
      notes: 'Hands-on demonstration of building a responsive website with Bootstrap.',
      mainVideo: mainVideo(
        'Bootstrap Demo',
        'https://www.youtube.com/watch?v=CKcyCs8sua8'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Bootstrap - Mobile first', 'https://www.youtube.com/watch?v=Nl-OP4NoJQI', '27:00'),
        sessionVideo('2.2 - Bootstrap - Desktop version', 'https://www.youtube.com/watch?v=AaeClQmrH3I', '14:00'),
      ],
      resources: [
        resource('Bootstrap_Demo_Starter.zip', 'zip'),
      ],
    }),
  ],
};

module.exports = WEEK_06;