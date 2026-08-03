/**
 * @fileoverview Week 19: React States & Hooks
 * Phase 3 - Node, Express, MySql and React.js
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-19.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_19 = {
  number: 19,
  phaseNumber: 3,
  title: 'React States & Hooks',
  lessons: [
    createLesson({
      id: 'p3-w19-l1',
      title: 'React states',
      isFreePreview: false,
      notes: 'Understand the difference between state and props, how to add and update states in class components, and component lifecycle methods.',
      mainVideo: mainVideo(
        'React States',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Definition of state: what is the difference between state and props?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Steps to add and use states in your class based component', 'PLACEHOLDER_YOUTUBE_ID', '07:00'),
        sessionVideo('1.3 - Updating state values in your class based component: handling events in react', 'PLACEHOLDER_YOUTUBE_ID', '24:00'),
        sessionVideo('1.4 - Updating state values in your class based component: setState() method', 'PLACEHOLDER_YOUTUBE_ID', '33:00'),
        sessionVideo('1.5 - React component\'s lifecycle methods (class based)', 'PLACEHOLDER_YOUTUBE_ID', '54:00'),
      ],
      resources: [
        resource('React_States_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p3-w19-l2',
      title: 'React Hooks',
      isFreePreview: false,
      notes: 'Learn modern React Hooks including useState, useEffect, and useContext to manage state and side effects in functional components.',
      mainVideo: mainVideo(
        'React Hooks',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - What are React hooks, why do we use them and what rules should we follow when using them?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Basic React hooks: steps to implement useState() hook', 'PLACEHOLDER_YOUTUBE_ID', '12:00'),
        sessionVideo('2.3 - Basic React hooks: using useState() to change a state\'s value based on previous state value', 'PLACEHOLDER_YOUTUBE_ID', '35:00'),
        sessionVideo('2.4 - Basic React hooks: steps to implement useEffect() hook', 'PLACEHOLDER_YOUTUBE_ID', '41:00'),
        sessionVideo('2.5 - Basic React hooks: steps to implement context API and useContext() hook', 'PLACEHOLDER_YOUTUBE_ID', '54:00'),
      ],
      resources: [
        resource('React_Hooks_CheatSheet.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_19;