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
        'https://www.youtube.com/watch?v=65VeYzd54Ec'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction: why are we learning ReactJS?', 'https://www.youtube.com/watch?v=53UHG8i-dp0', '09:00'),
        sessionVideo('1.2 - What is ReactJS?', 'https://www.youtube.com/watch?v=P3L47AGdLWY', '08:00'),
        sessionVideo('1.3 - How does ReactJS work? What makes React faster?', 'https://www.youtube.com/watch?v=Ir0hZTFBxnE', '10:00'),
        sessionVideo('1.4 - Generating HTML using vanilla JavaScript vs generating HTML using ReactJS', 'https://www.youtube.com/watch?v=jzsEJJwVhmM', '21:00'),
        sessionVideo('1.5 - Getting started with React development: installing React, configuring npm, using create-react-app', 'https://www.youtube.com/watch?v=QuRO-kugOLU', '14:00'),
        sessionVideo('1.6 - Getting started with React Development: understanding the file structure of a react app', 'https://www.youtube.com/watch?v=Lp4UEWJz0Ro', '11:00'),
        sessionVideo('1.7 - What is JSX (JavaScript XML)?', 'https://www.youtube.com/watch?v=bjE4RjNoEsE', '12:00'),
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
        'https://www.youtube.com/watch?v=f354MvMZfJM'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction to react components: why do we build Apple website using react components?', 'https://www.youtube.com/watch?v=Odt1D7s8slk', '01:00'),
        sessionVideo('2.2 - React components: definition and types', 'https://www.youtube.com/watch?v=zJMA7GVZ5A8', '10:00'),
        sessionVideo('2.3 - Function based components: steps to create functional components', 'https://www.youtube.com/watch?v=-baF-pm57yg', '22:00'),
        sessionVideo('2.4 - Building Apple website using React (functional component)', 'https://www.youtube.com/watch?v=SelrbUwEh_0', '19:00'),
      ],
      resources: [
        resource('React_Functional_Components.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_17;