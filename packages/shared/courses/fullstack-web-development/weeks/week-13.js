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
        sessionVideo('1.1 - What is jQuery? Why do we need it and what can we do with it?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Adding jQuery library to our web page', 'PLACEHOLDER_YOUTUBE_ID', '12:00'),
        sessionVideo('1.3 - Selecting elements with jQuery (id, class, element selectors)', 'PLACEHOLDER_YOUTUBE_ID', '23:00'),
        sessionVideo('1.4 - Selecting elements with jQuery (filters)', 'PLACEHOLDER_YOUTUBE_ID', '32:00'),
        sessionVideo('1.5 - Updating or altering values: content and elements', 'PLACEHOLDER_YOUTUBE_ID', '40:00'),
        sessionVideo('1.6 - Altering values: attributes, form value, looping through elements', 'PLACEHOLDER_YOUTUBE_ID', '45:00'),
        sessionVideo('1.7 - Handling events', 'PLACEHOLDER_YOUTUBE_ID', '01:03:00'),
        sessionVideo('1.8 - Effects and animations in jQuery', 'PLACEHOLDER_YOUTUBE_ID', '01:08:00'),
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
        sessionVideo('2.1 - Synchronous Programming', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Asynchronous Programming', 'PLACEHOLDER_YOUTUBE_ID', '13:00'),
        sessionVideo('2.3 - JS callback function', 'PLACEHOLDER_YOUTUBE_ID', '24:00'),
        sessionVideo('2.4 - JS Promises', 'PLACEHOLDER_YOUTUBE_ID', '32:00'),
        sessionVideo('2.5 - JS Async-Await', 'PLACEHOLDER_YOUTUBE_ID', '45:00'),
        sessionVideo('2.6 - How to implement our own promise based API promise constructor', 'PLACEHOLDER_YOUTUBE_ID', '52:00'),
      ],
      resources: [
        resource('Async_JS_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_13;