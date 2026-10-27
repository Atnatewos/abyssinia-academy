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
        sessionVideo('1.1 - What are functions? Why do we need them?', 'https://www.youtube.com/watch?v=svvZC8qHB6c', '00:00'),
        sessionVideo('1.2 - How do we declare/define a function in JS?', 'https://www.youtube.com/watch?v=Al7mb6bchF8', '05:00'),
        sessionVideo('1.3 - Functions with arguments', 'https://www.youtube.com/watch?v=LAan1V-Vhr8', '14:00'),
        sessionVideo('1.4 - Functions that return a value', 'https://www.youtube.com/watch?v=ApyCpoy5Q7c', '19:00'),
        sessionVideo('1.5 - Variable scoping', 'https://www.youtube.com/watch?v=ssm-uUrzgH8', '25:00'),
        sessionVideo('1.6 - Arrow functions', 'https://www.youtube.com/watch?v=CwlFBgQKBL4', '37:00'),
        sessionVideo('1.7 - Understanding statements: conditional statements', 'https://www.youtube.com/watch?v=dUlYcZeQ1Iw', '45:00'),
        sessionVideo('1.8 - If statements', 'https://www.youtube.com/watch?v=3V_A9le0KMA', '56:00'),
        sessionVideo('1.9 - If ... else Statements', 'https://www.youtube.com/watch?v=ldz58iS5t64', '01:09:00'),
        sessionVideo('1.10 - Switch statements', 'https://www.youtube.com/watch?v=orhTuICEJhc', '01:19:00'),
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
        sessionVideo('2.1 - Algorithm explained with example (addition function)', 'https://www.youtube.com/watch?v=bBnBKkPy8x8', '00:00'),
        sessionVideo('2.2 - Algorithm explained with example (the soccer points function)', 'https://www.youtube.com/watch?v=cJ74f9TZjqw', '41:00'),
        sessionVideo('2.3 - Algorithm explained with example (the area of a triangle function)', 'https://www.youtube.com/watch?v=ItgMco7e54Y', '01:00:00'),
        sessionVideo('2.4 - Algorithm explained with example (the minute to second converter function)', 'https://www.youtube.com/watch?v=hyGPkOtcpB8', '01:05:00'),
      ],
      resources: [
        resource('Algorithmic_Thinking.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_09;