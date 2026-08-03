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
      isFreePreview: true,
      notes: 'Learn the fundamentals of programming and why JavaScript is the language of the web.',
      mainVideo: mainVideo(
        'Introduction to programming basics (Part I)',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction to phase 2', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Why do we need to learn JavaScript?', 'PLACEHOLDER_YOUTUBE_ID', '09:00'),
        sessionVideo('1.3 - Definition of JavaScript: a language to develop interactive web pages', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
        sessionVideo('1.4 - Definition of JavaScript: a programming language to instruct our computer', 'PLACEHOLDER_YOUTUBE_ID', '19:00'),
        sessionVideo('1.5 - Definition of JavaScript: a scripting language to instruct the browser', 'PLACEHOLDER_YOUTUBE_ID', '43:00'),
        sessionVideo('1.6 - Core JavaScript: syntax and semantics', 'PLACEHOLDER_YOUTUBE_ID', '50:00'),
        sessionVideo('1.7 - Including JavaScript in our HTML and using the console for debugging JavaScript', 'PLACEHOLDER_YOUTUBE_ID', '58:00'),
        sessionVideo('1.8 - Core JavaScript (variables): declaring variables', 'PLACEHOLDER_YOUTUBE_ID', '01:06:00'),
        sessionVideo('1.9 - Core JavaScript (variables): assigning value to and changing value of a variable and rules on naming variables', 'PLACEHOLDER_YOUTUBE_ID', '01:17:00'),
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
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - What is data structure and why do we need to structure data?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Types of data structures', 'PLACEHOLDER_YOUTUBE_ID', '08:00'),
        sessionVideo('2.3 - Operators: arithmetic operators and assignment operators', 'PLACEHOLDER_YOUTUBE_ID', '18:00'),
        sessionVideo('2.4 - Operators: string operators (concatenation) and comparison operators', 'PLACEHOLDER_YOUTUBE_ID', '32:00'),
        sessionVideo('2.5 - Operators: logical operators', 'PLACEHOLDER_YOUTUBE_ID', '49:00'),
        sessionVideo('2.6 - Weak typing', 'PLACEHOLDER_YOUTUBE_ID', '57:00'),
        sessionVideo('2.7 - Arrays: definition, declaration and adding values to an array, accessing array values with index', 'PLACEHOLDER_YOUTUBE_ID', '01:08:00'),
      ],
      resources: [
        resource('JS_Data_Structures.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_08;