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
        sessionVideo('1.3 - Adding CSS instructions to HTML documents', 'https://www.youtube.com/watch?v=SN30JK-5PsM', '14:00'),
        sessionVideo('1.4 - CSS units', 'https://www.youtube.com/watch?v=86QjDzEd1oQ', '11:00'),
        sessionVideo('1.5 - Thinking in terms of containers', 'https://www.youtube.com/watch?v=J90pTe0bBMw', '14:00'),
        sessionVideo('1.6 - Naming containers and elements using id and class', 'https://www.youtube.com/watch?v=Uuzb8yjaU4w', '07:00'),
        sessionVideo('1.7 - Selecting elements using id, class and element type', 'https://www.youtube.com/channel/UCxA7AzkI2Sndf8S1G5rSkwQ', '06:00'),
        sessionVideo('1.8 - Selecting elements using star (wild selector), hover and descendant selectors', 'https://www.youtube.com/watch?v=zmu_VhNLx8c', '12:00'),
      ],
      resources: [
        resource('CSS_Basics_Guide.pdf', 'pdf'),
      ],
    }),

        createLesson({
      id: 'p1-w3-l1',
      title: 'Suggested videos to watch',
      isFreePreview: false,
      notes: 'Learn how to style your HTML pages with Cascading Style Sheets.',
      // mainVideo: mainVideo(
      //   'Basics of CSS',
      //   'https://www.youtube.com/watch?v=99ujQ2Hvnew'
      // ),
      sessionVideos: [
        sessionVideo('Chrome Developers Tool - Crash Course', 'https://www.youtube.com/watch?v=x4q86IjJFag', '51:19'),
        sessionVideo('Emmet For Faster HTML & CSS Workflow', 'https://www.youtube.com/watch?v=5BIAdWNcr8Y', '35:34'),
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
        sessionVideo('2.1 - Introduction to CSS properties', 'https://www.youtube.com/watch?v=uh-jcIl_m8k', '12:00'),
        sessionVideo('2.2 - Introduction to most common CSS properties', 'https://www.youtube.com/watch?v=oGdQ7aM-qRM', '05:00'),
        sessionVideo('2.3 - Display property', 'https://www.youtube.com/watch?v=QVRCtX1yKdA', '19:00'),
        sessionVideo('2.4 - Position property', 'https://www.youtube.com/watch?v=szKfeNI-mvI', '08:00'),
        sessionVideo('2.5 - Width and height', 'https://www.youtube.com/watch?v=pwaCADnx_Iw', '09:00'),
        sessionVideo('2.6 - Margin and padding', 'https://www.youtube.com/watch?v=teRjI-jfeS0', '17:00'),
        sessionVideo('2.7 - Applying margin and padding properties to puppies page project', 'https://www.youtube.com/watch?v=o63_SjND94Q', '10:00'),
        sessionVideo('2.8 - Borders', 'https://www.youtube.com/watch?v=AnF7ahG4Iww', '02:00'),
        sessionVideo('2.9 - Background', 'https://www.youtube.com/watch?v=FMaP6epuC8k', '01:00'),
        sessionVideo('2.10 - Fonts', 'https://www.youtube.com/watch?v=ZDYS78UtTYI', '06:00'),
        sessionVideo('2.11 - Color', 'https://www.youtube.com/watch?v=dfmh6HpfjKQ', '01:00'),
        sessionVideo('2.12 - Priority order in CSS', 'https://www.youtube.com/watch?v=KWyNscGiIzs', '04:00'),
        sessionVideo('2.13 - Conclusion', 'https://www.youtube.com/watch?v=QgEwfGVgBqo', '01:00'),
      ],
      resources: [
        resource('CSS_Properties_Reference.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_03;