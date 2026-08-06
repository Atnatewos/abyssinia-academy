/**
 * @fileoverview Week 8: Introduction to Programming
 * Phase 2 - Learn coding with JavaScript
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-08.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_08 = {
  number: 8,
  phaseNumber: 2,
  title: 'Introduction to Programming',
  lessons: [
    createLesson({
      id: 'p2-w8-l1',
      title: 'Introduction to programming basics (Part I)',
      isFreePreview: false,
      notes: 'Learn the fundamentals of programming and why JavaScript is the language of the web.',
      mainVideo: mainVideo(
        'Introduction to programming basics (Part I)',
        'https://www.youtube.com/watch?v=KG7GZ98zQiA'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction to phase 2', 'https://www.youtube.com/watch?v=hrzwuyXVjOk', '00:00'),
        sessionVideo('1.2 - Why do we need to learn JavaScript?', 'https://www.youtube.com/watch?v=o5tH-DCEwCA', '09:00'),
        sessionVideo('1.3 - Definition of JavaScript: a language to develop interactive web pages', 'https://www.youtube.com/watch?v=bK7mhLvq7Wg', '16:00'),
        sessionVideo('1.4 - Definition of JavaScript: a programming language to instruct our computer', 'https://www.youtube.com/watch?v=U-9e598XG48', '19:00'),
        sessionVideo('1.5 - Definition of JavaScript: a scripting language to instruct the browser', 'https://www.youtube.com/watch?v=Bgs6ARJVGfo', '43:00'),
        sessionVideo('1.6 - Core JavaScript: syntax and semantics', 'https://www.youtube.com/watch?v=n3J_QnZY4N4', '50:00'),
        sessionVideo('1.7 - Including JavaScript in our HTML and using the console for debugging JavaScript', 'https://www.youtube.com/watch?v=o4gnNNxnqxc', '58:00'),
        sessionVideo('1.8 - Core JavaScript (variables): declaring variables', 'https://www.youtube.com/watch?v=fCADuLXm2y4', '01:06:00'),
        sessionVideo('1.9 - Core JavaScript (variables): assigning value to and changing value of a variable and rules on naming variables', 'https://www.youtube.com/watch?v=IRN63GgdGcQ', '01:17:00'),
      ],
      resources: [
        resource('JS_Basics_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w8-l2',
      title: 'Introduction to programming basics (part II)',
      isFreePreview: false,
      notes: 'Understand data structures, operators, and arrays in JavaScript.',
      mainVideo: mainVideo(
        'Introduction to programming basics (part II)',
        'https://www.youtube.com/watch?v=Qz8sXIPn1I8'
      ),
      sessionVideos: [
        sessionVideo('2.1 - What is data structure and why do we need to structure data?', 'https://www.youtube.com/watch?v=r7Pn8Pv8OJM', '00:00'),
        sessionVideo('2.2 - Types of data structures', 'https://www.youtube.com/watch?v=qQojJe-OVK0', '08:00'),
        sessionVideo('2.3 - Operators: arithmetic operators and assignment operators', 'https://www.youtube.com/watch?v=8BvWDgt8Aaw', '18:00'),
        sessionVideo('2.4 - Operators: string operators (concatenation) and comparison operators', 'https://www.youtube.com/watch?v=yMqpBKCSAZU', '32:00'),
        sessionVideo('2.5 - Operators: logical operators', 'https://www.youtube.com/watch?v=OMNPxeT8YT4', '49:00'),
        sessionVideo('2.6 - Weak typing', 'https://www.youtube.com/watch?v=M3yoPjjmtss', '57:00'),
        sessionVideo('2.7 - Arrays: definition, declaration and adding values to an array, accessing array values with index', 'https://www.youtube.com/watch?v=Ch5IdLy2loA', '01:08:00'),
      ],
      resources: [
        resource('JS_Data_Structures.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_08;