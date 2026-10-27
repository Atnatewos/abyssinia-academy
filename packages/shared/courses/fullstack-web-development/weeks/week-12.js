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
        'https://www.youtube.com/watch?v=47WKc3QGW_k'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Relationship between JavaScript and HTML: why do we need JS?', 'https://www.youtube.com/watch?v=Ej4Gup22_Uc', '00:00'),
        sessionVideo('1.2 - How do we add JS into our HTML?', 'https://www.youtube.com/watch?v=1valslfEHEY', '15:00'),
        sessionVideo('1.3 - Understanding DOM: how do HTML and JS work together?', 'https://www.youtube.com/watch?v=Ssfvdn5rC8M', '24:00'),
        sessionVideo('1.4 - The DOM tree', 'https://www.youtube.com/watch?v=TyPwo7SB2fE', '42:00'),
        sessionVideo('1.5 - DOM manipulation: introduction', 'https://www.youtube.com/watch?v=auAJBleqNj8', '52:00'),
        sessionVideo('1.6 - DOM manipulation: selecting elements (part 1)', 'https://www.youtube.com/watch?v=ysONvfI-4IU', '57:00'),
        sessionVideo('1.7 - DOM manipulation: selecting elements (part 2)', 'https://www.youtube.com/watch?v=fQx4_9KNg10', '01:12:00'),
        sessionVideo('1.8 - Selecting elements in HTML collection vs NodeList', 'https://www.youtube.com/watch?v=S_E_NzJWgUg', '01:25:00'),
        sessionVideo('1.9 - Selecting elements (traversing between multiple elements)', 'https://www.youtube.com/watch?v=tlPKqOsGex8', '01:49:00'),
        sessionVideo('1.10 - Altering values (working with HTML content)', 'https://www.youtube.com/watch?v=hD1svefNDVU', '01:57:00'),
        sessionVideo('1.11 - Altering values (working with HTML attribute)', 'https://www.youtube.com/watch?v=NWeGtpOw2Us', '04:05'),
        sessionVideo('1.12 - Altering values (working with inline styling)', 'https://www.youtube.com/watch?v=7Ni9Ah_GfJM', '0617'),
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
        'https://www.youtube.com/watch?v=QnObxDVjKYU'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction', 'https://www.youtube.com/watch?v=QHU2Z8Hc5fc', '00:00'),
        sessionVideo('2.2 - What are JS events and JS event types?', 'https://www.youtube.com/watch?v=lRdrqmMdM18', '03:00'),
        sessionVideo('2.3 - Event types', 'https://www.youtube.com/watch?v=XkL2iGP9nSI', '07:00'),
        sessionVideo('2.4 - Event handling', 'https://www.youtube.com/watch?v=vr1dFarq3Lo', '03:16'),
        sessionVideo('2.5 - Ways to bind an event (HTML event handlers)', 'https://www.youtube.com/watch?v=kOiZXIMChj4', '09:00'),
        sessionVideo('2.6 - Ways to bind an event (traditional DOM event handlers)', 'https://www.youtube.com/watch?v=WocjAh7s324', '04:58'),
        sessionVideo('2.7 - Ways to bind an event (DOM level event listeners)', 'https://www.youtube.com/watch?v=0VerZwU7R84', '01:27'),
        sessionVideo('2.8 - Halting default behaviors', 'https://www.youtube.com/watch?v=Ez7E-mCa3sk', '01:59'),
        sessionVideo('2.9 - Explaining how to approach the form validation exercise', 'https://www.youtube.com/watch?v=mGt1acApaKg', '09:27'),
      ],
      resources: [
        resource('JS_Events_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_12;