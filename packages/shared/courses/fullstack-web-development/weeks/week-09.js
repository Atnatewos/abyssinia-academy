/**
 * @fileoverview Week 9: Functions and Algorithmic Thinking
 * Phase 2 - Learn coding with JavaScript
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-09.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_09 = {
  number: 9,
  phaseNumber: 2,
  title: 'Functions and Algorithmic Thinking',
  lessons: [
    createLesson({
      id: 'p2-w9-l1',
      title: 'Functions and conditional statements',
      isFreePreview: false,
      notes: 'Master functions, arguments, return values, scoping, and conditional statements.',
      mainVideo: mainVideo(
        'Functions and conditional statements',
        'https://www.youtube.com/watch?v=qGYw3r9vfr8'
      ),
      sessionVideos: [
        sessionVideo('1.1 - What are functions? Why do we need them?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - How do we declare/define a function in JS?', 'PLACEHOLDER_YOUTUBE_ID', '05:00'),
        sessionVideo('1.3 - Functions with arguments', 'PLACEHOLDER_YOUTUBE_ID', '14:00'),
        sessionVideo('1.4 - Functions that return a value', 'PLACEHOLDER_YOUTUBE_ID', '19:00'),
        sessionVideo('1.5 - Variable scoping', 'PLACEHOLDER_YOUTUBE_ID', '25:00'),
        sessionVideo('1.6 - Arrow functions', 'PLACEHOLDER_YOUTUBE_ID', '37:00'),
        sessionVideo('1.7 - Understanding statements: conditional statements', 'PLACEHOLDER_YOUTUBE_ID', '45:00'),
        sessionVideo('1.8 - If statements', 'PLACEHOLDER_YOUTUBE_ID', '56:00'),
        sessionVideo('1.9 - If ... else Statements', 'PLACEHOLDER_YOUTUBE_ID', '01:09:00'),
        sessionVideo('1.10 - Switch statements', 'PLACEHOLDER_YOUTUBE_ID', '01:19:00'),
      ],
      resources: [
        resource('JS_Functions_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w9-l2',
      title: 'Algorithmic thinking (part I)',
      isFreePreview: false,
      notes: 'Learn how to think algorithmically by solving real-world problems with functions.',
      mainVideo: mainVideo(
        'Algorithmic thinking (Part I)',
        'https://www.youtube.com/watch?v=BlAknpjEbWs'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Algorithm explained with example (addition function)', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Algorithm explained with example (the soccer points function)', 'PLACEHOLDER_YOUTUBE_ID', '41:00'),
        sessionVideo('2.3 - Algorithm explained with example (the area of a triangle function)', 'PLACEHOLDER_YOUTUBE_ID', '01:00:00'),
        sessionVideo('2.4 - Algorithm explained with example (the minute to second converter function)', 'PLACEHOLDER_YOUTUBE_ID', '01:05:00'),
      ],
      resources: [
        resource('Algorithmic_Thinking.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_09;