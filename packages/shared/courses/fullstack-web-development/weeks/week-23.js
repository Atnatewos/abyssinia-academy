/**
 * @fileoverview Week 23: Project Week 3 - Amazon Clone (Backend)
 * Phase 4 - The Project Phase: Building Fullstack Applications
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-23.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_23 = {
  number: 23,
  phaseNumber: 4,
  title: 'Project Week 3: Amazon Clone (Backend)',
  lessons: [
    createLesson({
      id: 'p4-w23-l1',
      title: 'Amazon Clone (Backend)',
      isFreePreview: false,
      notes: 'Complete the Amazon clone with Firebase Authentication, Stripe payment integration, and deployment using Firebase Functions and Netlify.',
    //   mainVideo: mainVideo(
    //     'Full Project Build: Amazon Clone Backend & Deployment',
    //     'PLACEHOLDER_YOUTUBE_ID'
    //   ),
      sessionVideos: [
        sessionVideo('1.1 - Setting up Firebase', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Enabling Firebase Authentication', 'PLACEHOLDER_YOUTUBE_ID', '15:00'),
        sessionVideo('1.3 - Building Auth page UI', 'PLACEHOLDER_YOUTUBE_ID', '17:00'),
        sessionVideo('1.4 - Authentication functionality', 'PLACEHOLDER_YOUTUBE_ID', '42:00'),
        sessionVideo('1.5 - Sign out, loading and error states', 'PLACEHOLDER_YOUTUBE_ID', '01:05:00'),
        sessionVideo('1.6 - Setting up stripe', 'PLACEHOLDER_YOUTUBE_ID', '01:35:00'),
        sessionVideo('1.7 - Installing firebase tools CLI', 'PLACEHOLDER_YOUTUBE_ID', '01:42:00'),
        sessionVideo('1.8 - Setting up backend payment API using Firebase function', 'PLACEHOLDER_YOUTUBE_ID', '01:55:00'),
        sessionVideo('1.9 - Refactoring backend payment API without functions', 'PLACEHOLDER_YOUTUBE_ID', '02:26:00'),
        sessionVideo('1.10 - Building Payment page UI', 'PLACEHOLDER_YOUTUBE_ID', '02:37:00'),
        sessionVideo('1.11 - Client side payment functionality', 'PLACEHOLDER_YOUTUBE_ID', '03:27:00'),
        sessionVideo('1.12 - Route protection', 'PLACEHOLDER_YOUTUBE_ID', '04:15:00'),
        sessionVideo('1.13 - Building orders page UI, orders query and project wrap up', 'PLACEHOLDER_YOUTUBE_ID', '04:32:00'),
        sessionVideo('1.14 - Backend deployment using cloud firebase function', 'PLACEHOLDER_YOUTUBE_ID', '05:10:00'),
        sessionVideo('1.15 - Backend deployment using Render', 'PLACEHOLDER_YOUTUBE_ID', '05:27:00'),
        sessionVideo('1.16 - Frontend deployment using Netlify', 'PLACEHOLDER_YOUTUBE_ID', '05:46:00'),
      ],
      resources: [
        resource('Firebase_Setup_Guide.pdf', 'pdf'),
        resource('Stripe_Integration_Docs.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_23;