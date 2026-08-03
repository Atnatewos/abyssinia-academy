/**
 * @fileoverview Week 17: Introduction to React and Functional Components
 * Phase 3 - Node, Express, MySql and React.js
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-17.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_17 = {
  number: 17,
  phaseNumber: 3,
  title: 'Introduction to React and Functional Components',
  lessons: [
    createLesson({
      id: 'p3-w17-l1',
      title: 'Introduction to React',
      isFreePreview: false,
      notes: 'Learn why ReactJS is popular, how it works under the hood, and how to set up a React development environment using create-react-app.',
      mainVideo: mainVideo(
        'Introduction to React',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction: why are we learning ReactJS?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - What is ReactJS?', 'PLACEHOLDER_YOUTUBE_ID', '09:00'),
        sessionVideo('1.3 - How does ReactJS work? What makes React faster?', 'PLACEHOLDER_YOUTUBE_ID', '17:00'),
        sessionVideo('1.4 - Generating HTML using vanilla JavaScript vs generating HTML using ReactJS', 'PLACEHOLDER_YOUTUBE_ID', '27:00'),
        sessionVideo('1.5 - Getting started with React development: installing React, configuring npm, using create-react-app', 'PLACEHOLDER_YOUTUBE_ID', '48:00'),
        sessionVideo('1.6 - Getting started with React Development: understanding the file structure of a react app', 'PLACEHOLDER_YOUTUBE_ID', '01:02:00'),
        sessionVideo('1.7 - What is JSX (JavaScript XML)?', 'PLACEHOLDER_YOUTUBE_ID', '01:13:00'),
      ],
      resources: [
        resource('React_Setup_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p3-w17-l2',
      title: 'React components (functional components)',
      isFreePreview: false,
      notes: 'Understand React components, the difference between functional and class components, and build an Apple website clone using functional components.',
      mainVideo: mainVideo(
        'React components - functional components',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction to react components: why do we build Apple website using react components?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - React components: definition and types', 'PLACEHOLDER_YOUTUBE_ID', '01:00'),
        sessionVideo('2.3 - Function based components: steps to create functional components', 'PLACEHOLDER_YOUTUBE_ID', '11:00'),
        sessionVideo('2.4 - Building Apple website using React (functional component)', 'PLACEHOLDER_YOUTUBE_ID', '33:00'),
      ],
      resources: [
        resource('React_Functional_Components.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_17;