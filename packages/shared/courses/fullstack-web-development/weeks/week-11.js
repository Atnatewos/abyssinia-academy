/**
 * @fileoverview Week 11: Algorithm Writing
 * Phase 2 - Learn coding with JavaScript
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-11.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_11 = {
  number: 11,
  phaseNumber: 2,
  title: 'Algorithm Writing',
  lessons: [
    createLesson({
      id: 'p2-w11-l1',
      title: 'Algorithm writing (solving algorithmic problems) - part I',
      isFreePreview: false,
      notes: 'Practice writing algorithms to solve complex problems like finding hidden words and nested arrays.',
      mainVideo: mainVideo(
        'Algorithm writing (solving algorithmic problems) - Part I',
        'https://www.youtube.com/watch?v=FPtkQOONB8o'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Algorithm writing with example (the hidden word in a crowd function)', 'https://www.youtube.com/watch?v=wH2ORM6x7ZU', '00:00'),
        sessionVideo('1.2 - Algorithm writing with example (the nested array function)', 'https://www.youtube.com/watch?v=GGEQlsNCNqY', '46:00'),
      ],
      resources: [
        resource('Algorithm_Writing_Part1.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w11-l2',
      title: 'Algorithm writing (solving algorithmic problems) - part II',
      isFreePreview: false,
      notes: 'Continue mastering algorithmic problem solving with magic arrays and sorting functions.',
      mainVideo: mainVideo(
        'Algorithm writing (solving algorithmic problems) - Part II',
        'https://www.youtube.com/watch?v=HCaXSFOg2fs'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Algorithm writing with example (the magic array function)', 'https://www.youtube.com/watch?v=i1HhsOUIWgU', '33:00'),
        sessionVideo('2.2 - Algorithm writing with example (the sort function)', 'https://www.youtube.com/watch?v=yvIbRhEY6UI', '38:00'),
      ],
      resources: [
        resource('Algorithm_Writing_Part2.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_11;