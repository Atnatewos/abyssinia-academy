/**
 * @fileoverview Week 27: Abe Garage Project Week 3 (Sessions VIII - X)
 * Phase 5 - Abe Garage Project: Building Fullstack Application
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-27.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_27 = {
  number: 27,
  phaseNumber: 5,
  title: 'Abe Garage Project Week 3: Sessions VIII – X',
  lessons: [
    createLesson({
      id: 'p5-w27-l1',
      title: 'Session VIII: Building Abe Garage\'s App - Setting up the Context Provider',
      isFreePreview: false,
      notes: 'Implement React Context API to manage global application state, including user sessions, theme preferences, and notification systems.',
    //   mainVideo: mainVideo(
    //     'Building Abe Garage\'s App - Setting up the Context Provider',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Building Abe Garage\'s App - Setting up the Context Provider', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Context_API_Best_Practices.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p5-w27-l2',
      title: 'Session IX: Building Abe Garage\'s App - Authorization',
      isFreePreview: false,
      notes: 'Implement fine-grained authorization logic to ensure employees can only access resources and perform actions permitted by their specific roles.',
    //   mainVideo: mainVideo(
    //     'Building Abe Garage\'s App - Authorization',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('2.1 - Building Abe Garage\'s App - Authorization', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('Authorization_Matrix.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p5-w27-l3',
      title: 'Session X: Building Abe Garage\'s App - Understand the GitHub Workflow (Employees List Page)',
      isFreePreview: false,
      notes: 'Master the professional GitHub workflow including feature branching, pull requests, code reviews, and merging while building the Employees List page.',
    //   mainVideo: mainVideo(
    //     'Building Abe Garage\'s App - Understand the GitHub Workflow (Employees List Page)',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('3.1 - Building Abe Garage\'s App - Understand the GitHub Workflow (Employees List Page)', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
      ],
      resources: [
        resource('GitHub_Workflow_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_27;