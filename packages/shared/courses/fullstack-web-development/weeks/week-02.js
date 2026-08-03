/**
 * @fileoverview Week 2: HTML
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-02.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_02 = {
  number: 2,
  phaseNumber: 1,
  title: 'HTML',

  lessons: [

    createLesson({
      id: 'p1-w2-l1',
      title: 'Basics of HTML - part I',
      isFreePreview: true,
      notes: 'Introduction to HTML. Learn the building blocks of every website on the internet.',
      mainVideo: mainVideo(
        'Basics of HTML - part I',
        'https://www.youtube.com/watch?v=nZqcWgwucGA'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction to HTML', 'https://www.youtube.com/watch?v=OicbXZ5tfow', '01:00'),
        sessionVideo('1.2 - Understanding HTML', 'https://www.youtube.com/watch?v=0eWdKTQE_ok', '13:00'),
        sessionVideo('1.3 - How to write HTML code in VSC', 'https://www.youtube.com/watch?v=IPpON4L_rLg', '14:00'),
        sessionVideo('1.4 - Basic rules of HTML tags', 'https://www.youtube.com/watch?v=LiBFQNQ6Fks', '17:00'),
        sessionVideo('1.5 - Building your first HTML page', 'https://www.youtube.com/watch?v=6KLmXFCFnAw', '17:00'),
        sessionVideo('1.6 - Most commonly used HTML5 tags', 'https://www.youtube.com/watch?v=LoGakIQaB2A', '05:00'),
        sessionVideo('1.7 - Building Apple\'s terms and policy page in class', 'https://www.youtube.com/watch?v=JCREpmcB58k', '08:00'),
        sessionVideo('1.8 - Conclusion', 'https://www.youtube.com/watch?v=MwnZsTbkQXc', '01:00'),
      ],
      resources: [
        resource('HTML_Basics_Guide.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w2-l2',
      title: 'Basics of HTML - part II',
      isFreePreview: false,
      notes: 'Continue mastering HTML with advanced tags and real-world page structure.',
      mainVideo: mainVideo(
        'Basics of HTML - part II',
        'https://www.youtube.com/watch?v=eN9zxsuwSqs'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction', 'https://www.youtube.com/watch?v=zjaYRntdDGE', '13:00'),
        sessionVideo('2.2 - Steps to create an HTML Page', 'https://www.youtube.com/watch?v=IDibaq1AkaE', '15:00'),
        sessionVideo('2.3 - Common HTML tags (nav, anchor, list items)', 'https://www.youtube.com/watch?v=ht5vkTm33_w', '15:00'),
        sessionVideo('2.4 - Common HTML tags (header, section, div, footer)', 'https://www.youtube.com/watch?v=nO3gomTl9Ng', '07:00'),
        sessionVideo('2.5 - Common HTML tags (h1, h2, h3, h4, h5, h6, hr)', 'https://www.youtube.com/watch?v=LuywXru29nM', '09:00'),
        sessionVideo('2.6 - Common HTML tags (img)', 'https://www.youtube.com/watch?v=bHGvq11p5zY', '15:00'),
        sessionVideo('2.7 - Common HTML tags (form, video and iframe)', 'https://www.youtube.com/watch?v=6kgcIsvRD80', '17:00'),
      ],
      resources: [
        resource('HTML_Tags_Reference.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_02;