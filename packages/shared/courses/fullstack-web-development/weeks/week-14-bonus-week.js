/**
 * @fileoverview Week 14: Bonus Week (Optional Classes)
 * Phase 2 - Learn coding with JavaScript
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-14.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_14 = {
  number: 14,
  phaseNumber: 2,
  title: 'Bonus Week: Optional Classes',
  lessons: [
    createLesson({
      id: 'p2-w14-l1',
      title: 'Regular expressions in JavaScript',
      isFreePreview: false,
      notes: 'Master pattern matching and text manipulation using Regular Expressions (RegExp).',
      mainVideo: mainVideo(
        'Regular expressions in JavaScript',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - What are regular expressions (RegExp)?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - How do we use RegExp?', 'PLACEHOLDER_YOUTUBE_ID', '17:00'),
        sessionVideo('1.3 - RegExp in JavaScript', 'PLACEHOLDER_YOUTUBE_ID', '41:00'),
        sessionVideo('1.4 - Using the RegExp object and the methods under it', 'PLACEHOLDER_YOUTUBE_ID', '01:01:00'),
      ],
      resources: [
        resource('RegExp_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w14-l2',
      title: 'Building websites using Shopify',
      isFreePreview: false,
      notes: 'Learn how to build and launch an e-commerce website using Shopify.',
      mainVideo: mainVideo(
        'Building websites using Shopify',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Introduction', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Building your homepage and Shopify\'s pricing plans', 'PLACEHOLDER_YOUTUBE_ID', '02:00'),
        sessionVideo('2.3 - Adding products and different pages', 'PLACEHOLDER_YOUTUBE_ID', '34:00'),
        sessionVideo('2.4 - Adding payment, setting up shipment and domain name', 'PLACEHOLDER_YOUTUBE_ID', '57:00'),
      ],
      resources: [
        resource('Shopify_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w14-l3',
      title: 'Building websites using Squarespace',
      isFreePreview: false,
      notes: 'Create professional websites quickly using Squarespace templates.',
      mainVideo: mainVideo(
        'Building websites using Squarespace',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('3.1 - Introduction', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('3.2 - Getting started with squarespace: collecting contents for our website', 'PLACEHOLDER_YOUTUBE_ID', '03:00'),
        sessionVideo('3.3 - Editing the template website', 'PLACEHOLDER_YOUTUBE_ID', '16:00'),
        sessionVideo('3.4 - Editing the "Home" page', 'PLACEHOLDER_YOUTUBE_ID', '35:00'),
        sessionVideo('3.5 - Finalizing our Squarespace website', 'PLACEHOLDER_YOUTUBE_ID', '54:00'),
      ],
      resources: [
        resource('Squarespace_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p2-w14-l4',
      title: 'JavaScript projects',
      isFreePreview: false,
      notes: 'Build real-world JavaScript projects including the classic Nokia Snake game.',
      mainVideo: mainVideo(
        'JavaScript projects',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('4.1 - Building Nokia phone\'s snake game (Sept 29th batch)', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('4.2 - Building Nokia phone\'s snake game (previous batch)', 'PLACEHOLDER_YOUTUBE_ID', '01:57:00'),
      ],
      resources: [
        resource('JS_Projects_Starter.zip', 'zip'),
      ],
    }),
    createLesson({
      id: 'p2-w14-l5',
      title: 'Asynchronous JavaScript - callbacks, promise and async-await',
      isFreePreview: false,
      notes: 'Deep dive into asynchronous JavaScript patterns without jQuery.',
      mainVideo: mainVideo(
        'Asynchronous JavaScript - callbacks, promise and async-await',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('5.1 - Introduction: what is asynchronous JavaScript?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('5.2 - Callback functions', 'PLACEHOLDER_YOUTUBE_ID', '10:00'),
        sessionVideo('5.3 - Promise (creating a promise and states of a promise)', 'PLACEHOLDER_YOUTUBE_ID', '22:00'),
        sessionVideo('5.4 - Promise (consuming a promise)', 'PLACEHOLDER_YOUTUBE_ID', '49:00'),
        sessionVideo('5.5 - Promise (catching error/else)', 'PLACEHOLDER_YOUTUBE_ID', '59:00'),
        sessionVideo('5.6 - Promise (async-await)', 'PLACEHOLDER_YOUTUBE_ID', '01:18:00'),
      ],
      resources: [
        resource('Async_JS_Deep_Dive.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_14;