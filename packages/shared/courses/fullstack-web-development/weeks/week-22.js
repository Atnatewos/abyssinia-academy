/**
 * @fileoverview Week 22: Project Week 2 - Amazon Clone (Frontend)
 * Phase 4 - The Project Phase: Building Fullstack Applications
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-22.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_22 = {
  number: 22,
  phaseNumber: 4,
  title: 'Project Week 2: Amazon Clone (Frontend)',
  lessons: [
    createLesson({
      id: 'p4-w22-l1',
      title: 'Amazon Clone (Frontend)',
      isFreePreview: false,
      notes: 'Build the frontend of an Amazon clone. Master React Router, Context API, useReducer, and complex state management for a shopping cart.',
    //   mainVideo: mainVideo(
    //     'Full Project Build: Amazon Clone Frontend',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction', 'https://www.youtube.com/watch?v=qkJoRjggWL8', '14:00'),
        sessionVideo('1.2 - Header component', 'https://www.youtube.com/watch?v=sAtriy0sPCc', '23:00'),
        sessionVideo('1.3 - Carousel effect', 'https://www.youtube.com/watch?v=4R6IDpOAKv8', '08:00'),
        sessionVideo('1.4 - Category', 'https://www.youtube.com/watch?v=OvEl7LpPNj0', '10:00'),
        sessionVideo('1.5 - Single product component', 'https://www.youtube.com/watch?v=Vm96o8DwiOo', '23:00'),
        sessionVideo('1.6 - Header routing', 'https://www.youtube.com/watch?v=-ra3HwMT4wA', '10:00'),
        sessionVideo('1.7 - Category routing', 'https://www.youtube.com/watch?v=A0IbvPuqApM', '10:00'),
        sessionVideo('1.8 - Detail page routing', 'https://www.youtube.com/watch?v=-w4fi3PWabg', '06:00'),
        sessionVideo('1.9 - Loading functionality integration', 'https://www.youtube.com/watch?v=S5KJVUSzptc', '06:00'),
        sessionVideo('1.10 - Detail page styling and addition of description on single product', 'https://www.youtube.com/watch?v=pBwUxEQOUNo', '07:00'),
        sessionVideo('1.11 - useReducer Hook and UseContextAPI explanation and example', 'https://www.youtube.com/watch?v=aUsxWDvzsZo', '20:00'),
        sessionVideo('1.12 - Add to cart functionality', 'https://www.youtube.com/watch?v=dH9C-plQuDQ', '21:00'),
        sessionVideo('1.13 - Header sticky part implementation', 'https://www.youtube.com/watch?v=MnDbWxMQjY4', '01:00'),
        sessionVideo('1.14 - Cart page - Part one', 'https://www.youtube.com/watch?v=u1H31_XY6ro', '17:00'),
        sessionVideo('1.15 - Cart page - Part two', 'https://www.youtube.com/watch?v=dW2rngfY4Xk', '07:00'),
        sessionVideo('1.16 - Cart page - Part three', 'https://www.youtube.com/watch?v=OZEbHBC-BB4', '17:00'),
      ],
      resources: [
        resource('Amazon_Frontend_Starter.zip', 'zip'),
      ],
    }),
  ],
};

module.exports = WEEK_22;