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
        sessionVideo('1.1 - Decisions & loops (for loop)', 'https://www.youtube.com/watch?v=pamOW4yxh98', '00:00'),
        sessionVideo('1.2 - Decisions & loops (while Loop)', 'https://www.youtube.com/watch?v=9AqmcsKITZo', '25:00'),
        sessionVideo('1.3 - Example - Add up until a number', 'https://www.youtube.com/watch?v=oZ6NM_2YbdQ', '31:00'),
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
        sessionVideo('2.1 - The object-oriented data model', 'https://www.youtube.com/watch?v=KbowHGX_hK0', '00:00'),
        sessionVideo('2.2 - Object oriented programming in JavaScript', 'https://www.youtube.com/watch?v=nQC8oM04jdc', '13:00'),
        sessionVideo('2.3 - JavaScript object constructors', 'https://www.youtube.com/watch?v=jgtm6AVeclw', '27:00'),
        sessionVideo('2.4 - Mostly used built-in JavaScript object (string object)', 'https://www.youtube.com/watch?v=uVWEukJhvYI', '40:00'),
        sessionVideo('2.5 - Mostly used built-in JavaScript object (array object)', 'https://www.youtube.com/watch?v=1iCkAUje4Ro', '54:00'),
        sessionVideo('2.6 - Mostly used built-in JavaScript object (math object)', 'https://www.youtube.com/watch?v=qBk7wILnsmc', '01:01:00'),
      ],
      resources: [
        resource('JS_OOP_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_10;