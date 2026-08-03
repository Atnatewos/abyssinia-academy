/**
 * @fileoverview Week 26: Abe Garage Project Week 2 (Sessions V - VII)
 * Phase 5 - Abe Garage Project: Building Fullstack Application
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-26.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_26 = {
  number: 26,
  phaseNumber: 5,
  title: 'Abe Garage Project Week 2: Sessions V – VII',
  lessons: [
    createLesson({
      id: 'p5-w26-l1',
      title: 'Session V: Initial setup of the main Garage App',
      isFreePreview: false,
      notes: 'Initialize the production repository, configure the development environment, and set up the project structure for the main Abe Garage application.',
    //   mainVideo: mainVideo(
    //     'Initial setup of the main Garage App',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Initial setup of the main Garage App', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Project_Structure_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p5-w26-l2',
      title: 'Session VI: Building Abe Garage\'s App - Building the Authentication System',
      isFreePreview: false,
      notes: 'Implement secure user authentication using JWT, including registration, login, and password hashing for both admin and employee roles.',
    //   mainVideo: mainVideo(
    //     'Building Abe Garage\'s App - Building the Authentication System',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('2.1 - Building Abe Garage\'s App - Building the Authentication System', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Auth_Flow_Diagram.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p5-w26-l3',
      title: 'Session VII: Building Abe Garage\'s App - Building the Authentication System ... continued',
      isFreePreview: false,
      notes: 'Continue building the authentication system, focusing on protected routes, role-based access control, and session management.',
    //   mainVideo: mainVideo(
    //     'Building Abe Garage\'s App - Building the Authentication System ... continued',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('3.1 - Building Abe Garage\'s App - Building the Authentication System ... continued', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('RBAC_Implementation.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_26;