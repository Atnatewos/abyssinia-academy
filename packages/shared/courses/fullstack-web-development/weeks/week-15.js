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
        'https://www.youtube.com/watch?v=0p7KcNID6-s'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Getting started with Node.js (installing and running our script on Node)', 'https://www.youtube.com/watch?v=awBV4XgnN7M', '11:00'),
        sessionVideo('1.2 - What is back-end development?', 'https://www.youtube.com/watch?v=BDnDhvOa_rA', '05:00'),
        sessionVideo('1.3 - Modular structure: avoiding problems of global namespace collision', 'https://www.youtube.com/watch?v=D8A_PYUJxbI', '19:00'),
        sessionVideo('1.4 - Approaches to avoid namespace collision: the IEFE Way and the CommonJS Way', 'https://www.youtube.com/watch?v=1k24BUkBRqE', '11:00'),
        sessionVideo('1.5 - Basic concept of Node module', 'https://www.youtube.com/watch?v=xZ29puccLGk', '08:00'),
        sessionVideo('1.6 - Standards used to write Node modules: commonJS and ES6', 'https://www.youtube.com/watch?v=C7srhakgdqU', '26:00'),
        sessionVideo('1.7 - Managing Node modules using NPM: core and contributed modules', 'https://www.youtube.com/watch?v=_RYalSgzCzU', '20:00'),
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
        'https://www.youtube.com/watch?v=g88uTz1sAfA'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction: core node modules', 'https://www.youtube.com/watch?v=U4fH1R8GNLM', '11:00'),
        sessionVideo('2.2 - Most common core Node modules (fs, os, path, http)', 'https://www.youtube.com/watch?v=cs-C6KKcOAY', '16:00'),
        sessionVideo('2.3 - Building HTTP web server using HTTP module: defining a web server and listener', 'https://www.youtube.com/watch?v=0Ahq7nJecVE', '10:00'),
        sessionVideo('2.4 - Building HTTP web server using NodeJS: serving a simple message using HTTP module', 'https://www.youtube.com/watch?v=EWQrweLNCjg', '21:00'),
        sessionVideo('2.5 - Building HTTP web server using HTTP module: serving static files with HTTP', 'https://www.youtube.com/watch?v=UQPI0nu2kbY', '58:00'),
        sessionVideo('2.6 - Building HTTP web server using HTTP module: serving our static Apple website with HTTP', 'https://www.youtube.com/watch?v=qMGOaP6es3Q', '16:00'),
        sessionVideo('2.7 - Building HTTP web server using Express module: serving our static Apple website with Express', 'https://www.youtube.com/watch?v=U-TElB3JV_Y', '16:00'),
      ],
      resources: [
        resource('Express_Server_Starter.zip', 'zip'),
      ],
    }),
  ],
};

module.exports = WEEK_15;