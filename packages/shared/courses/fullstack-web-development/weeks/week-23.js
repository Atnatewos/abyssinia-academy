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
        sessionVideo('1.1 - Setting up Firebase', 'https://www.youtube.com/watch?v=j8oiM91ILp8', '15:00'),
        sessionVideo('1.2 - Enabling Firebase Authentication', 'https://www.youtube.com/watch?v=DxNsVBKLzls', '01:00'),
        sessionVideo('1.3 - Building Auth page UI', 'https://www.youtube.com/watch?v=_-ONSz3dafY', '25:00'),
        sessionVideo('1.4 - Authentication functionality', 'https://www.youtube.com/watch?v=GVTe7rcu1mE', '22:00'),
        sessionVideo('1.5 - Sign out, loading and error states', 'https://www.youtube.com/watch?v=Te53Aq37Ofg', '30:00'),
        sessionVideo('1.6 - Setting up stripe', 'https://www.youtube.com/watch?v=1OX8G5TaOXc', '07:00'),
        sessionVideo('1.7 - Installing firebase tools CLI', 'https://www.youtube.com/watch?v=-6Epek2hw0E', '12:00'),
        sessionVideo('1.8 - Setting up backend payment API using Firebase function', 'https://www.youtube.com/watch?v=xY4r6yKUC68', '30:00'),
        sessionVideo('1.9 - Refactoring backend payment API without functions', 'https://www.youtube.com/watch?v=Yltbl1d75Wg', '11:00'),
        sessionVideo('1.10 - Building Payment page UI', 'https://www.youtube.com/watch?v=-3DRDwJIFHI', '50:00'),
        sessionVideo('1.11 - Client side payment functionality', 'https://www.youtube.com/watch?v=_A7BenI6A3g', '48:00'),
        sessionVideo('1.12 - Route protection', 'https://www.youtube.com/watch?v=UW_bdLI0OJk', '17:00'),
        sessionVideo('1.13 - Building orders page UI, orders query and project wrap up', 'https://www.youtube.com/watch?v=Q_MMHErHOuU', '38:00'),
        sessionVideo('1.14 - Backend deployment using cloud firebase function', 'https://www.youtube.com/watch?v=O9bHEfwfbtk', '16:00'),
        sessionVideo('1.15 - Backend deployment using Render', 'https://www.youtube.com/watch?v=RaZdNeJo8EI', '18:00'),
        sessionVideo('1.16 - Frontend deployment using Netlify', 'https://www.youtube.com/watch?v=GPop9jL8Ih4', '09:00'),
      ],
      resources: [
        resource('Firebase_Setup_Guide.pdf', 'pdf'),
        resource('Stripe_Integration_Docs.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_23;