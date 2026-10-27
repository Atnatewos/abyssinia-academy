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
        'https://www.youtube.com/watch?v=C4T3jn-Q-T4'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Definition of state: what is the difference between state and props?', 'https://www.youtube.com/watch?v=n9ke5_Q5Q1E', '07:00'),
        sessionVideo('1.2 - Steps to add and use states in your class based component', 'https://www.youtube.com/watch?v=9M_5ERSTS80', '17:00'),
        sessionVideo('1.3 - Updating state values in your class based component: handling events in react', 'https://www.youtube.com/watch?v=eAp4udCTf9g', '09:00'),
        sessionVideo('1.4 - Updating state values in your class based component: setState() method', 'https://www.youtube.com/watch?v=Ci7N5ubT5o0', '21:00'),
        sessionVideo('1.5 - React component\'s lifecycle methods (class based)', 'https://www.youtube.com/watch?v=gJoxF9qq9dk', '24:00'),
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
        'https://www.youtube.com/watch?v=NJidUGVO_Fo'
      ),
      sessionVideos: [
        sessionVideo('2.1 - What are React hooks, why do we use them and what rules should we follow when using them?', 'https://www.youtube.com/watch?v=IiUjlso5WHY', '12:00'),
        sessionVideo('2.2 - Basic React hooks: steps to implement useState() hook', 'https://www.youtube.com/watch?v=L9S7RvfZV2E', '23:00'),
        sessionVideo('2.3 - Basic React hooks: using useState() to change a state\'s value based on previous state value', 'https://www.youtube.com/watch?v=gE3UQABppa8', '06:00'),
        sessionVideo('2.4 - Basic React hooks: steps to implement useEffect() hook', 'https://www.youtube.com/watch?v=fSRhK0nZmHw', '13:00'),
        sessionVideo('2.5 - Basic React hooks: steps to implement context API and useContext() hook', 'https://www.youtube.com/watch?v=hsLOpbLQyk8', '16:00'),
      ],
      resources: [
        resource('React_Hooks_CheatSheet.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_19;