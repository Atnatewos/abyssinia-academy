/**
 * @fileoverview Week 12: DOM Manipulation and JS Events
 * Phase 2 - Learn coding with JavaScript
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-12.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_12 = {
  number: 12,
  phaseNumber: 2,
  title: 'DOM Manipulation and JS Events',
  lessons: [
    createLesson({
      id: 'p2-w12-l1',
      title: 'JavaScript DOM manipulation',
      isFreePreview: false,
      notes: 'Learn how JavaScript interacts with HTML through the Document Object Model (DOM).',
      mainVideo: mainVideo(
        'JavaScript DOM manipulation',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Relationship between JavaScript and HTML: why do we need JS?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - How do we add JS into our HTML?', 'PLACEHOLDER_YOUTUBE_ID', '15:00'),
        sessionVideo('1.3 - Understanding DOM: how do HTML and JS work together?', 'PLACEHOLDER_YOUTUBE_ID', '24:00'),
        sessionVideo('1.4 - The DOM tree', 'PLACEHOLDER_YOUTUBE_ID', '42:00'),
        sessionVideo('1.5 - DOM manipulation: introduction', 'PLACEHOLDER_YOUTUBE_ID', '52:00'),
        sessionVideo('1.6 - DOM manipulation: selecting elements (part 1)', 'PLACEHOLDER_YOUTUBE_ID', '57:00'),
        sessionVideo('1.7 - DOM manipulation: selecting elements (part 2)', 'PLACEHOLDER_YOUTUBE_ID', '01:12:00'),
        sessionVideo('1.8 - Selecting elements in HTML collection vs NodeList', 'PLACEHOLDER_YOUTUBE_ID', '01:25:00'),
        sessionVideo('1.9 - Selecting elements (traversing between multiple elements)', 'PLACEHOLDER_YOUTUBE_ID', '01:49:00'),
        sessionVideo('1.10 - Altering values (working with HTML content)', 'PLACEHOLDER_YOUTUBE_ID', '01:57:00'),
        sessionVideo('1.11 - Altering values (working with HTML attribute)', 'PLACEHOLDER_YOUTUBE_ID', '02:09:00'),
        sessionVideo('1.12 - Altering values (working with inline styling)', 'PLACEHOLDER_YOUTUBE_ID', '02:13:00'),
      ],
      resources: [
        resource('DOM_Manipulation_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w12-l2',
      title: 'JavaScript events',
      isFreePreview: false,
      notes: 'Make your web pages interactive by handling user events like clicks, inputs, and form submissions.',
      mainVideo: mainVideo(
        'JavaScript events',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - What are JS events and JS event types?', 'PLACEHOLDER_YOUTUBE_ID', '03:00'),
        sessionVideo('2.3 - Event types', 'PLACEHOLDER_YOUTUBE_ID', '07:00'),
        sessionVideo('2.4 - Event handling', 'PLACEHOLDER_YOUTUBE_ID', '19:00'),
        sessionVideo('2.5 - Ways to bind an event (HTML event handlers)', 'PLACEHOLDER_YOUTUBE_ID', '22:00'),
        sessionVideo('2.6 - Ways to bind an event (traditional DOM event handlers)', 'PLACEHOLDER_YOUTUBE_ID', '31:00'),
        sessionVideo('2.7 - Ways to bind an event (DOM level event listeners)', 'PLACEHOLDER_YOUTUBE_ID', '35:00'),
        sessionVideo('2.8 - Halting default behaviors', 'PLACEHOLDER_YOUTUBE_ID', '36:00'),
        sessionVideo('2.9 - Explaining how to approach the form validation exercise', 'PLACEHOLDER_YOUTUBE_ID', '38:00'),
      ],
      resources: [
        resource('JS_Events_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_12;