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
        sessionVideo('1.1 - Create react-app and Setting up the Environment', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Building Netflix Header and Footer', 'PLACEHOLDER_YOUTUBE_ID', '14:00'),
        sessionVideo('1.3 - Get API key and Movies endpoint from TMDB', 'PLACEHOLDER_YOUTUBE_ID', '38:00'),
        sessionVideo('1.4 - Building Netflix Banner', 'PLACEHOLDER_YOUTUBE_ID', '58:00'),
        sessionVideo('1.5 - Building Netflix rows', 'PLACEHOLDER_YOUTUBE_ID', '01:19:00'),
        sessionVideo('1.6 - Netflix Project Deployment', 'PLACEHOLDER_YOUTUBE_ID', '02:02:00'),
      ],
      resources: [
        resource('Netflix_Clone_Starter.zip', 'zip'),
        resource('TMDB_API_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_21;