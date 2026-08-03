/**
 * @fileoverview Week 24: Project Week 4 - Evangadi Forum (Fullstack)
 * Phase 4 - The Project Phase: Building Fullstack Applications
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-24.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_24 = {
  number: 24,
  phaseNumber: 4,
  title: 'Project Week 4: Evangadi Forum',
  lessons: [
    createLesson({
      id: 'p4-w24-l1',
      title: 'Evangadi Forum (Backend)',
      isFreePreview: false,
      notes: 'Build a robust backend for a forum application using Node.js, Express, PostgreSQL, and JWT authentication.',
    //   mainVideo: mainVideo(
    //     'Full Project Build: Evangadi Forum Backend',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction and final result', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Database design and implementation', 'PLACEHOLDER_YOUTUBE_ID', '10:00'),
        sessionVideo('1.3 - Connecting to database', 'PLACEHOLDER_YOUTUBE_ID', '28:00'),
        sessionVideo('1.4 - Setup backend express server', 'PLACEHOLDER_YOUTUBE_ID', '41:00'),
        sessionVideo('1.5 - Postman Setup and testing backend API', 'PLACEHOLDER_YOUTUBE_ID', '53:00'),
        sessionVideo('1.6 - Setup express router (refactor our code)', 'PLACEHOLDER_YOUTUBE_ID', '01:00:00'),
        sessionVideo('1.7 - Setup controller (refactor our code)', 'PLACEHOLDER_YOUTUBE_ID', '01:11:00'),
        sessionVideo('1.8 - Database connection (async await)', 'PLACEHOLDER_YOUTUBE_ID', '01:19:00'),
        sessionVideo('1.9 - Register user controller', 'PLACEHOLDER_YOUTUBE_ID', '01:29:00'),
        sessionVideo('1.10 - Login user controller', 'PLACEHOLDER_YOUTUBE_ID', '02:08:00'),
        sessionVideo('1.11 - JWT (JSON Web Token)', 'PLACEHOLDER_YOUTUBE_ID', '02:22:00'),
        sessionVideo('1.12 - Authentication middleware and protected Route', 'PLACEHOLDER_YOUTUBE_ID', '02:37:00'),
        sessionVideo('1.13 - Environment variables (.env file)', 'PLACEHOLDER_YOUTUBE_ID', '03:08:00'),
      ],
      resources: [
        resource('Evangadi_DB_Schema.sql', 'file'),
      ],
    }),
    createLesson({
      id: 'p4-w24-l2',
      title: 'Evangadi Forum (Frontend)',
      isFreePreview: false,
      notes: 'Connect the React frontend to the Express backend, implementing protected routes and user authentication flows.',
    //   mainVideo: mainVideo(
    //     'Full Project Build: Evangadi Forum Frontend',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('2.1 - Creating React App', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Setting up React Router Dom', 'PLACEHOLDER_YOUTUBE_ID', '05:00'),
        sessionVideo('2.3 - Registration page and axios setup', 'PLACEHOLDER_YOUTUBE_ID', '13:00'),
        sessionVideo('2.4 - Login page', 'PLACEHOLDER_YOUTUBE_ID', '38:00'),
        sessionVideo('2.5 - Frontend protected route implementation', 'PLACEHOLDER_YOUTUBE_ID', '50:00'),
      ],
      resources: [
        resource('Evangadi_Frontend_Starter.zip', 'zip'),
      ],
    }),
    createLesson({
      id: 'p4-w24-l3',
      title: 'Deployment',
      isFreePreview: false,
      notes: 'Deploy the full-stack application. Setup remote database, deploy Node backend, and deploy React frontend.',
    //   mainVideo: mainVideo(
    //     'Full Project Build: Evangadi Forum Deployment',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('3.1 - Introduction to deployment', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('3.2 - How to setup remote database', 'PLACEHOLDER_YOUTUBE_ID', '04:00'),
        sessionVideo('3.3 - How to setup and deploy node application (Back-end)', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
        sessionVideo('3.4 - How to setup and deploy React application (Front-end)', 'PLACEHOLDER_YOUTUBE_ID', '27:00'),
      ],
      resources: [
        resource('Deployment_Checklist.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_24;