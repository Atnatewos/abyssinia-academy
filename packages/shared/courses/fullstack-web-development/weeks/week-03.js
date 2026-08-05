/**
 * @fileoverview Week 3: CSS
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-03.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_03 = {
  number: 3,
  phaseNumber: 1,
  title: 'CSS',

  lessons: [

    createLesson({
      id: 'p1-w3-l1',
      title: 'Basics of CSS',
      isFreePreview: false,
      notes: 'Learn how to style your HTML pages with Cascading Style Sheets.',
      mainVideo: mainVideo(
        'Basics of CSS',
        'https://www.youtube.com/watch?v=99ujQ2Hvnew'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction', 'https://www.youtube.com/watch?v=SzgchikrLr4', '01:15'),
        sessionVideo('1.2 - Understanding CSS (CSS versions and sending styling instructions to the browser)', 'https://www.youtube.com/watch?v=vIyL4BfwSos', '12:00'),
        sessionVideo('1.3 - Adding CSS instructions to HTML documents', 'PLACEHOLDER_YOUTUBE_ID', '14:00'),
        sessionVideo('1.4 - CSS units', 'PLACEHOLDER_YOUTUBE_ID', '11:00'),
        sessionVideo('1.5 - Thinking in terms of containers', 'PLACEHOLDER_YOUTUBE_ID', '14:00'),
        sessionVideo('1.6 - Naming containers and elements using id and class', 'PLACEHOLDER_YOUTUBE_ID', '07:00'),
        sessionVideo('1.7 - Selecting elements using id, class and element type', 'PLACEHOLDER_YOUTUBE_ID', '06:00'),
        sessionVideo('1.8 - Selecting elements using star (wild selector), hover and descendant selectors', 'PLACEHOLDER_YOUTUBE_ID', '12:00'),
      ],
      resources: [
        resource('CSS_Basics_Guide.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w3-l2',
      title: 'CSS Properties',
      isFreePreview: false,
      notes: 'Deep dive into the most important CSS properties for professional web development.',
      mainVideo: mainVideo(
        'CSS Properties',
        'https://www.youtube.com/watch?v=VsW5y5rm2AU'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction to CSS properties', 'PLACEHOLDER_YOUTUBE_ID', '12:00'),
        sessionVideo('2.2 - Introduction to most common CSS properties', 'PLACEHOLDER_YOUTUBE_ID', '05:00'),
        sessionVideo('2.3 - Display property', 'PLACEHOLDER_YOUTUBE_ID', '19:00'),
        sessionVideo('2.4 - Position property', 'PLACEHOLDER_YOUTUBE_ID', '08:00'),
        sessionVideo('2.5 - Width and height', 'PLACEHOLDER_YOUTUBE_ID', '09:00'),
        sessionVideo('2.6 - Margin and padding', 'PLACEHOLDER_YOUTUBE_ID', '17:00'),
        sessionVideo('2.7 - Applying margin and padding properties to puppies page project', 'PLACEHOLDER_YOUTUBE_ID', '10:00'),
        sessionVideo('2.8 - Borders', 'PLACEHOLDER_YOUTUBE_ID', '02:00'),
        sessionVideo('2.9 - Background', 'PLACEHOLDER_YOUTUBE_ID', '01:00'),
        sessionVideo('2.10 - Fonts', 'PLACEHOLDER_YOUTUBE_ID', '06:00'),
        sessionVideo('2.11 - Color', 'PLACEHOLDER_YOUTUBE_ID', '01:00'),
        sessionVideo('2.12 - Priority order in CSS', 'PLACEHOLDER_YOUTUBE_ID', '04:00'),
        sessionVideo('2.13 - Conclusion', 'PLACEHOLDER_YOUTUBE_ID', '01:00'),
      ],
      resources: [
        resource('CSS_Properties_Reference.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_03;