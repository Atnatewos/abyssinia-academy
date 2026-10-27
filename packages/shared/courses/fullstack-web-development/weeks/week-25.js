/**
 * @fileoverview Week 25: Abe Garage Project Week 1 (Sessions I - IV)
 * Phase 5 - Abe Garage Project: Building Fullstack Application
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-25.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_25 = {
  number: 25,
  phaseNumber: 5,
  title: 'Abe Garage Project Week 1: Sessions I – IV',
  lessons: [
    createLesson({
      id: 'p5-w25-l1',
      title: 'Session I: Business Development, System Design, Wireframes & UI Designs',
      isFreePreview: false,
      notes: 'Learn how to translate business requirements into system architecture, wireframes, and professional UI designs for the Abe Garage auto repair shop application.',
    //   mainVideo: mainVideo(
    //     'Business Development, System Design, Wireframes & UI Designs',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Business Development, System Design, Wireframes & UI Designs', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Abe_Garage_Wireframes.pdf', 'pdf'),
        resource('UI_Design_Assets.zip', 'zip'),
      ],
    }),
    createLesson({
      id: 'p5-w25-l2',
      title: 'Session II: Database and API Designs',
      isFreePreview: false,
      notes: 'Design the relational database schema and RESTful API endpoints required to manage employees, customers, orders, and services.',
    //   mainVideo: mainVideo(
    //     'Database and API Designs',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('2.1 - Database and API Designs', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Database_ER_Diagram.pdf', 'pdf'),
        resource('API_Endpoints_Doc.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p5-w25-l3',
      title: 'Session III: Building a demo app',
      isFreePreview: false,
      notes: 'Hands-on session building a functional demo application to validate the core business logic and user flows before full-scale development.',
    //   mainVideo: mainVideo(
    //     'Building a demo app',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('3.1 - Building a demo app', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Demo_App_Starter.zip', 'zip'),
      ],
    }),
    createLesson({
      id: 'p5-w25-l4',
      title: 'Session IV: Deploying the frontend and restructuring the demo app',
      isFreePreview: false,
      notes: 'Deploy the initial frontend to a cloud server and refactor the demo app codebase for scalability and maintainability.',
    //   mainVideo: mainVideo(
    //     'Deploying the frontend and restructuring the demo app',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('4.1 - Deploying the frontend and restructuring the demo app', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Deployment_Checklist.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_25;