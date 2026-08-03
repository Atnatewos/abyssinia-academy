/**
 * @fileoverview Week 20: API Integration & React Routing
 * Phase 3 - Node, Express, MySql and React.js
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-20.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_20 = {
  number: 20,
  phaseNumber: 3,
  title: 'API Integration & React Routing',
  lessons: [
    createLesson({
      id: 'p3-w20-l1',
      title: 'API Integration in React',
      isFreePreview: false,
      notes: 'Learn what APIs are, how JSON works, and how to fetch and display data from external APIs like YouTube in your React components.',
      mainVideo: mainVideo(
        'API integration',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction to API: what do we mean by API?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - What is JSON? Why is JSON format preferred to transmit data in web applications?', 'PLACEHOLDER_YOUTUBE_ID', '20:00'),
        sessionVideo('1.3 - API key: definition and steps to creating a YouTube API key', 'PLACEHOLDER_YOUTUBE_ID', '34:00'),
        sessionVideo('1.4 - How do we call/request a JSON data from YouTube?', 'PLACEHOLDER_YOUTUBE_ID', '48:00'),
        sessionVideo('1.5 - Demo on how to use the JSON data we obtained from YouTube API in our react component', 'PLACEHOLDER_YOUTUBE_ID', '01:01:00'),
      ],
      resources: [
        resource('API_Integration_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p3-w20-l2',
      title: 'React routing - Version 6',
      isFreePreview: false,
      notes: 'Master React Router v6 to handle navigation, nested routes, and single-page application routing in your React projects.',
      mainVideo: mainVideo(
        'React Routing',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Limitations of React without React Router', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Main parts of React Router', 'PLACEHOLDER_YOUTUBE_ID', '10:00'),
        sessionVideo('2.3 - Non existing routes and Nested routes', 'PLACEHOLDER_YOUTUBE_ID', '25:00'),
        sessionVideo('2.4 - iPhone Page - Products', 'PLACEHOLDER_YOUTUBE_ID', '37:00'),
        sessionVideo('2.5 - Single Product', 'PLACEHOLDER_YOUTUBE_ID', '01:04:00'),
        sessionVideo('2.6 - Additional Tips - fetching data from JSON file, React Bootstrap, Deployment', 'PLACEHOLDER_YOUTUBE_ID', '01:17:00'),
      ],
      resources: [
        resource('React_Router_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_20;