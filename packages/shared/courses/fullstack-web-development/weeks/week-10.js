/**
 * @fileoverview Week 10: Decision Loops and Object Oriented Programming
 * Phase 2 - Learn coding with JavaScript
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-10.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_10 = {
  number: 10,
  phaseNumber: 2,
  title: 'Decision Loops and Object Oriented Programming',
  lessons: [
    createLesson({
      id: 'p2-w10-l1',
      title: 'Decision loops',
      isFreePreview: false,
      notes: 'Control the flow of your programs with for loops, while loops, and practical examples.',
      mainVideo: mainVideo(
        'Decision loops',
        'https://www.youtube.com/watch?v=P00sozVnYbY'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Decisions & loops (for loop)', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Decisions & loops (while Loop)', 'PLACEHOLDER_YOUTUBE_ID', '25:00'),
        sessionVideo('1.3 - Example - Add up until a number', 'PLACEHOLDER_YOUTUBE_ID', '31:00'),
      ],
      resources: [
        resource('JS_Loops_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w10-l2',
      title: 'Introduction to object oriented programming',
      isFreePreview: false,
      notes: 'Understand the object-oriented data model and built-in JavaScript objects.',
      mainVideo: mainVideo(
        'Introduction to object-oriented programming',
        'https://www.youtube.com/watch?v=bFbp3aszv-8'
      ),
      sessionVideos: [
        sessionVideo('2.1 - The object-oriented data model', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Object oriented programming in JavaScript', 'PLACEHOLDER_YOUTUBE_ID', '13:00'),
        sessionVideo('2.3 - JavaScript object constructors', 'PLACEHOLDER_YOUTUBE_ID', '27:00'),
        sessionVideo('2.4 - Mostly used built-in JavaScript object (string object)', 'PLACEHOLDER_YOUTUBE_ID', '40:00'),
        sessionVideo('2.5 - Mostly used built-in JavaScript object (array object)', 'PLACEHOLDER_YOUTUBE_ID', '54:00'),
        sessionVideo('2.6 - Mostly used built-in JavaScript object (math object)', 'PLACEHOLDER_YOUTUBE_ID', '01:01:00'),
      ],
      resources: [
        resource('JS_OOP_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_10;