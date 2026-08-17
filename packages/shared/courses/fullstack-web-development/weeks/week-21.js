/**
 * @fileoverview Week 21: Project Week 1 - Netflix Clone
 * Phase 4 - The Project Phase: Building Fullstack Applications
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-21.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_21 = {
  number: 21,
  phaseNumber: 4,
  title: 'Project Week 1: Netflix Clone',
  lessons: [
    createLesson({
      id: 'p4-w21-l1',
      title: 'Netflix Clone',
      isFreePreview: false,
      notes: 'Build a fully functional Netflix clone using React and TMDB API. Learn environment setup, component architecture, and API integration.',
    //   mainVideo: mainVideo(
    //     'Full Project Build: Netflix Clone',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Create react-app and Setting up the Environment', 'https://www.youtube.com/watch?v=lfoPHdisTR8', '14:00'),
        sessionVideo('1.2 - Building Netflix Header and Footer', 'https://www.youtube.com/watch?v=ENcwAfnuOMc', '29:00'),
        sessionVideo('1.3 - Get API key and Movies endpoint from TMDB', 'https://www.youtube.com/watch?v=PyV5-pJToEs', '20:00'),
        sessionVideo('1.4 - Building Netflix Banner', 'https://www.youtube.com/watch?v=hxIzn4XqVHg', '21:00'),
        sessionVideo('1.5 - Building Netflix rows', 'https://www.youtube.com/watch?v=dLz9KMQiyR8', '43:00'),
        sessionVideo('1.6 - Netflix Project Deployment', 'https://www.youtube.com/watch?v=U253V65NJsg', '10:58'),
      ],
      resources: [
        resource('Netflix_Clone_Starter.zip', 'zip'),
        resource('TMDB_API_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_21;