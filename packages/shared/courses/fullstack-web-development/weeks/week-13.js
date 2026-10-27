/**
 * @fileoverview Week 13: jQuery and Asynchronous JavaScript
 * Phase 2 - Learn coding with JavaScript
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-13.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_13 = {
  number: 13,
  phaseNumber: 2,
  title: 'jQuery and Asynchronous JavaScript',
  lessons: [
    createLesson({
      id: 'p2-w13-l1',
      title: 'jQuery',
      isFreePreview: false,
      notes: 'Learn jQuery to simplify DOM manipulation, event handling, and animations.',
      mainVideo: mainVideo(
        'jQuery',
        'https://www.youtube.com/watch?v=yQCOkc5eJ9o'
      ),
      sessionVideos: [
        sessionVideo('1.1 - What is jQuery? Why do we need it and what can we do with it?', 'https://www.youtube.com/watch?v=zvqyIFfmesM', '12:00'),
        sessionVideo('1.2 - Adding jQuery library to our web page', 'https://www.youtube.com/watch?v=wu6qO3TfcR0', '12:00'),
        sessionVideo('1.3 - Selecting elements with jQuery (id, class, element selectors)', 'https://www.youtube.com/watch?v=3TmvUwhcwcw', '09:00'),
        sessionVideo('1.4 - Selecting elements with jQuery (filters)', 'https://www.youtube.com/watch?v=1cTI0iKKeeg', '08:00'),
        sessionVideo('1.5 - Updating or altering values: content and elements', 'https://www.youtube.com/watch?v=xeMWfMyup9w', '13:00'),
        sessionVideo('1.6 - Altering values: attributes, form value, looping through elements', 'https://www.youtube.com/watch?v=1jW2YWzvoQU', '09:00'),
        sessionVideo('1.7 - Handling events', 'https://www.youtube.com/watch?v=TnX_RpCtXj4', '05:00'),
        sessionVideo('1.8 - Effects and animations in jQuery', 'https://www.youtube.com/watch?v=6bu5jQUSZcY', '12:27'),
      ],
      resources: [
        resource('jQuery_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w13-l2',
      title: 'Asynchronous JavaScript - Callbacks, Promise and Async-Await (jQuery Based)',
      isFreePreview: false,
      notes: 'Understand synchronous vs asynchronous programming, callbacks, promises, and async/await.',
      mainVideo: mainVideo(
        'Asynchronous JavaScript - Callbacks, Promise and Async-Await (jQuery Based)',
        'https://www.youtube.com/watch?v=LZkp2ByN-is'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Synchronous Programming', 'https://www.youtube.com/watch?v=4uQADWLSrz0', '13:00'),
        sessionVideo('2.2 - Asynchronous Programming', 'https://www.youtube.com/watch?v=UjbN8KrM8EI', '11:00'),
        sessionVideo('2.3 - JS callback function', 'https://www.youtube.com/watch?v=MN6BxmpL5qY', '08:00'),
        sessionVideo('2.4 - JS Promises', 'https://www.youtube.com/watch?v=cQ4pAlFq-DU', '32:00'),
        sessionVideo('2.5 - JS Async-Await', 'https://www.youtube.com/watch?v=PITAO6JX4k4', '07:00'),
        sessionVideo('2.6 - How to implement our own promise based API promise constructor', 'https://www.youtube.com/watch?v=2968KZ9S2Qo', '20:00'),
      ],
      resources: [
        resource('Async_JS_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_13;