/**
 * @fileoverview Week 15: Node Modules & Web Servers
 * Phase 3 - Node, Express, MySql and React.js
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-15.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_15 = {
  number: 15,
  phaseNumber: 3,
  title: 'Node Modules & Web Servers',
  lessons: [
    createLesson({
      id: 'p3-w15-l1',
      title: 'Introduction to Node modules',
      isFreePreview: false,
      notes: 'Learn about back-end development, modular structure, avoiding namespace collision, and managing Node modules using NPM.',
      mainVideo: mainVideo(
        'Introduction to Node modules',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Getting started with Node.js (installing and running our script on Node)', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - What is back-end development?', 'PLACEHOLDER_YOUTUBE_ID', '11:00'),
        sessionVideo('1.3 - Modular structure: avoiding problems of global namespace collision', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
        sessionVideo('1.4 - Approaches to avoid namespace collision: the IEFE Way and the CommonJS Way', 'PLACEHOLDER_YOUTUBE_ID', '35:00'),
        sessionVideo('1.5 - Basic concept of Node module', 'PLACEHOLDER_YOUTUBE_ID', '46:00'),
        sessionVideo('1.6 - Standards used to write Node modules: commonJS and ES6', 'PLACEHOLDER_YOUTUBE_ID', '54:00'),
        sessionVideo('1.7 - Managing Node modules using NPM: core and contributed modules', 'PLACEHOLDER_YOUTUBE_ID', '01:21:00'),
      ],
      resources: [
        resource('Node_Modules_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p3-w15-l2',
      title: 'Building web server (http & Express)',
      isFreePreview: false,
      notes: 'Build HTTP web servers using core Node modules and the Express framework to serve static files and websites.',
      mainVideo: mainVideo(
        'Building web server - http & Express',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction: core node modules', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Most common core Node modules (fs, os, path, http)', 'PLACEHOLDER_YOUTUBE_ID', '11:00'),
        sessionVideo('2.3 - Building HTTP web server using HTTP module: defining a web server and listener', 'PLACEHOLDER_YOUTUBE_ID', '27:00'),
        sessionVideo('2.4 - Building HTTP web server using NodeJS: serving a simple message using HTTP module', 'PLACEHOLDER_YOUTUBE_ID', '37:00'),
        sessionVideo('2.5 - Building HTTP web server using HTTP module: serving static files with HTTP', 'PLACEHOLDER_YOUTUBE_ID', '58:00'),
        sessionVideo('2.6 - Building HTTP web server using HTTP module: serving our static Apple website with HTTP', 'PLACEHOLDER_YOUTUBE_ID', '01:16:00'),
        sessionVideo('2.7 - Building HTTP web server using Express module: serving our static Apple website with Express', 'PLACEHOLDER_YOUTUBE_ID', '01:32:00'),
      ],
      resources: [
        resource('Express_Server_Starter.zip', 'zip'),
      ],
    }),
  ],
};

module.exports = WEEK_15;