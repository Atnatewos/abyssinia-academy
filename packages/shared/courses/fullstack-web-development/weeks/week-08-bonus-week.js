/**
 * @fileoverview Week 8: Bonus - Deployment Demo
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-08.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_08 = {
  number: 8,
  phaseNumber: 1,
  title: 'Bonus week: Recommended videos to watch',

  lessons: [

    createLesson({
      id: 'p1-w8-l1',
      title: 'Introduction to computers',
      isFreePreview: false,
      notes: 'Live demonstration of deploying a real website using popular hosting platforms.',
      mainVideo: mainVideo(
        '1.1 - Introduction to computers class videos', 'https://www.youtube.com/watch?v=C_0ptaTCFvQ', '01:35:36'
      ),
    //     sessionVideos: [
    //     sessionVideo('1.1 - Introduction to computers class videos', 'https://www.youtube.com/watch?v=C_0ptaTCFvQ', '01:35:36'),
    //   ],
      resources: [
        resource('Deployment_Demo_Notes.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w8-l2',
      title: 'The making of the Internet',
      isFreePreview: false,
      notes: 'Live demonstration of deploying a real website using popular hosting platforms.',
      mainVideo: mainVideo(
        '2.1 - The making of the Internet class video', 'https://www.youtube.com/watch?v=I7IchkA2cvo', '02:13:21'
      ),
    //     sessionVideos: [
    //     sessionVideo('2.1 - The making of the Internet class video', 'https://www.youtube.com/watch?v=I7IchkA2cvo', '02:13:21'),
    //   ],
      resources: [
        resource('Deployment_Demo_Notes.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_08;