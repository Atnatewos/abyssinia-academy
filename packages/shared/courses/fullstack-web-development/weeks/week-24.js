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
        sessionVideo('1.1 - Introduction and final result', 'https://www.youtube.com/watch?v=lkIcSuZOn1k', '10:00'),
        sessionVideo('1.2 - Database design and implementation', 'https://www.youtube.com/watch?v=yY2EZPOMu1s', '18:00'),
        sessionVideo('1.3 - Connecting to database', 'https://www.youtube.com/watch?v=Sn7nEbfLCws', '12:00'),
        sessionVideo('1.4 - Setup backend express server', 'https://www.youtube.com/watch?v=zxR_yuwQDlY', '12:00'),
        sessionVideo('1.5 - Postman Setup and testing backend API', 'https://www.youtube.com/watch?v=XnsBGKutcVE', '53:00'),
        sessionVideo('1.6 - Setup express router (refactor our code)', 'https://www.youtube.com/watch?v=JA9BpYtL9hs', '10:00'),
        sessionVideo('1.7 - Setup controller (refactor our code)', 'https://www.youtube.com/watch?v=oZMkLHa9ZRk', '08:00'),
        sessionVideo('1.8 - Database connection (async await)', 'https://www.youtube.com/watch?v=FyeoFhw9Wqg', '09:00'),
        sessionVideo('1.9 - Register user controller', 'https://www.youtube.com/watch?v=PfqBCfLu654', '39:00'),
        sessionVideo('1.10 - Login user controller', 'https://www.youtube.com/watch?v=7T73i4UFJXk', '14:00'),
        sessionVideo('1.11 - JWT (JSON Web Token)', 'https://www.youtube.com/watch?v=W8JLAHXnJvg', '14:00'),
        sessionVideo('1.12 - Authentication middleware and protected Route', 'https://www.youtube.com/watch?v=-Xd86SxFvtA', '31:00'),
        sessionVideo('1.13 - Environment variables (.env file)', 'https://www.youtube.com/watch?v=5Ybp0Aunty8', '15:00'),
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
        sessionVideo('2.1 - Creating React App', 'https://www.youtube.com/watch?v=rWq4wQzX_3s', '04:00'),
        sessionVideo('2.2 - Setting up React Router Dom', 'https://www.youtube.com/watch?v=ggwAwq_YEDM', '08:00'),
        sessionVideo('2.3 - Registration page and axios setup', 'https://www.youtube.com/watch?v=wvmD8FOeM8I', '25:00'),
        sessionVideo('2.4 - Login page', 'https://www.youtube.com/watch?v=5Ya-WeEtb-o', '12:00'),
        sessionVideo('2.5 - Frontend protected route implementation', 'https://www.youtube.com/watch?v=jnrXeVVbqyw', '22:00'),
      ],
      resources: [
        resource('Evangadi_Frontend_Starter.zip', 'zip'),
      ],
    }),
    // createLesson({
    //   id: 'p4-w24-l3',
    //   title: 'Deployment',
    //   isFreePreview: false,
    //   notes: 'Deploy the full-stack application. Setup remote database, deploy Node backend, and deploy React frontend.',
    // //   mainVideo: mainVideo(
    // //     'Full Project Build: Evangadi Forum Deployment',
    // //     'PLACEHOLDER_YOUTUBE_ID'
    // //   ),
    //   sessionVideos: [
    //     sessionVideo('3.1 - Introduction to deployment', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
    //     sessionVideo('3.2 - How to setup remote database', 'PLACEHOLDER_YOUTUBE_ID', '04:00'),
    //     sessionVideo('3.3 - How to setup and deploy node application (Back-end)', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
    //     sessionVideo('3.4 - How to setup and deploy React application (Front-end)', 'PLACEHOLDER_YOUTUBE_ID', '27:00'),
    //   ],
    //   resources: [
    //     resource('Deployment_Checklist.pdf', 'pdf'),
    //   ],
    // }),
  ],
};

module.exports = WEEK_24;