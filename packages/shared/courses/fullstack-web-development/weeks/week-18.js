/**
 * @fileoverview Week 18: React class component and props
 * Phase 3 - Node, Express, MySql and React.js
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-18.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_18 = {
  number: 18,
  phaseNumber: 3,
  title: 'React class component and props',
  lessons: [
    createLesson({
      id: 'p3-w18-l1',
      title: 'React components (class components) and props',
      isFreePreview: false,
      notes: 'Master ES6 classes, inheritance, destructuring, and learn how to convert functional components to class components and use React props.',
      mainVideo: mainVideo(
        'React components (class based components) and props',
        'https://www.youtube.com/watch?v=Yp27DqdOlTI'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Creating objects in JS using constructor function', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Traditional way of property inheritance in JS (using prototype object)', 'PLACEHOLDER_YOUTUBE_ID', '10:00'),
        sessionVideo('1.3 - ES6 way of property inheritance in JS (concept of class)', 'PLACEHOLDER_YOUTUBE_ID', '21:00'),
        sessionVideo('1.4 - ES6 way of property inheritance in JS (concept of class inheritance)', 'PLACEHOLDER_YOUTUBE_ID', '31:00'),
        sessionVideo('1.5 - Array and object destructuring', 'PLACEHOLDER_YOUTUBE_ID', '44:00'),
        sessionVideo('1.6 - Class based components: converting functional components into class components', 'PLACEHOLDER_YOUTUBE_ID', '49:00'),
        sessionVideo('1.7 - React prop', 'PLACEHOLDER_YOUTUBE_ID', '01:06:00'),
      ],
      resources: [
        resource('React_Class_Components.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p3-w18-l2',
      title: 'Props - Demo',
      isFreePreview: false,
      notes: 'Hands-on demonstration of using React props in a real-world application.',
      mainVideo: mainVideo(
        'Props Demo Class',
        'https://www.youtube.com/watch?v=9eeRBqoXb_c'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Full video - Props demo class (Previous batch)', 'https://www.youtube.com/watch?v=EZxsCrOBqvQ', '01:07:07'),
      ],
      resources: [
        resource('Props_Demo_Starter.zip', 'zip'),
      ],
    }),
  ],
};

module.exports = WEEK_18;