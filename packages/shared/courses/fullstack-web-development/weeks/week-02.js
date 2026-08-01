/**
 * @fileoverview Week 2: Modern CSS Layouts, Flexbox & CSS Grid
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-02.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_02 = {
  number: 2,
  phaseNumber: 1,
  title: 'Modern CSS Layouts, Flexbox & CSS Grid',

  lessons: [

    // LESSON 2.1 - FREE PREVIEW
    createLesson({
      id: 'p1-w2-l1',
      title: 'Mastering CSS Flexbox & Dynamic Alignment',
      duration: '60 mins',
      isFreePreview: true,
      notes: 'Flexbox is the foundation of modern CSS layout. This lesson covers flex containers vs flex items, main axis vs cross axis, justify-content, align-items, align-self, flex-grow, flex-shrink, flex-basis, and the order property. You will build a responsive navigation bar from scratch.',
      mainVideo: mainVideo(
        'Full Lecture: CSS Flexbox Mastery',
        'https://www.youtube.com/watch?v=3YW65K639wA'
      ),
      sessionVideos: [
        sessionVideo(
          '01. Flex Container vs Flex Items - Understanding the Model',
          'https://www.youtube.com/watch?v=3YW65K639wA',
          '00:00'
        ),
        sessionVideo(
          '02. Justify, Align, & Order - The Complete Guide',
          'https://www.youtube.com/watch?v=3YW65K639wA',
          '25:00'
        ),
        sessionVideo(
          '03. Building a Responsive Navigation Bar from Scratch',
          'https://www.youtube.com/watch?v=3YW65K639wA',
          '45:30'
        ),
      ],
      resources: [
        resource('Flexbox_Mastery_Sheet.pdf', 'pdf'),
        resource('Responsive_Navbar.zip', 'zip'),
      ],
    }),

    // LESSON 2.2 - LOCKED
    createLesson({
      id: 'p1-w2-l2',
      title: 'CSS Grid: Two-Dimensional Layout Mastery',
      duration: '55 mins',
      isFreePreview: false,
      notes: 'CSS Grid revolutionizes how we build complex page layouts with minimal markup. Learn grid containers, grid items, grid-template-columns, grid-template-rows, grid-template-areas, the fr unit, grid-gap, and how to build a real-world dashboard layout.',
      mainVideo: mainVideo(
        'Full Lecture: CSS Grid Complete Guide',
        'https://www.youtube.com/watch?v=9zBsd0EycVg'
      ),
      sessionVideos: [
        sessionVideo(
          '01. Grid Container & Grid Items - Setup & Basics',
          'https://www.youtube.com/watch?v=9zBsd0EycVg',
          '00:00'
        ),
        sessionVideo(
          '02. Grid Template Areas & the fr Unit Explained',
          'https://www.youtube.com/watch?v=9zBsd0EycVg',
          '20:00'
        ),
        sessionVideo(
          '03. Real-World Dashboard Layout - Hands-On Project',
          'https://www.youtube.com/watch?v=9zBsd0EycVg',
          '38:00'
        ),
      ],
      resources: [
        resource('CSS_Grid_CheatSheet.pdf', 'pdf'),
        resource('Dashboard_Layout_Starter.zip', 'zip'),
      ],
    }),
  ],
};

module.exports = WEEK_02;