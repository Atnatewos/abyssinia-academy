/**
 * @fileoverview Week 7: Project - Building and Launching Your Website
 * Phase 1 - Foundations of Modern Web Architecture
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-07.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_07 = {
  number: 7,
  phaseNumber: 1,
  title: 'Build & Launch Your Website',

  lessons: [

    createLesson({
      id: 'p1-w7-l1',
      title: 'Building your portfolio website',
      isFreePreview: false,
      notes: 'Create your professional portfolio website to showcase your skills to the world.',
      mainVideo: mainVideo(
        'Building your portfolio website',
        'https://www.youtube.com/watch?v=6-fRyyI4E7k'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Why do we need to build a portfolio website?', 'https://www.youtube.com/watch?v=TzuHAC7Y3Z4', '06:00'),
        sessionVideo('1.2 - How do we make our website impressive?', 'https://www.youtube.com/watch?v=ZBNRCu6Lz1g', '17:00'),
        sessionVideo('1.3 - Steps to follow to buy a template website and to build our website (part I)', 'https://www.youtube.com/watch?v=yHF7XK0h52A', '18:00'),
        sessionVideo('1.4 - Steps to follow to buy a template website and to build our website (part II)', 'https://www.youtube.com/watch?v=xHqr8Vr5vKU', '26:00'),
      ],
      resources: [
        resource('Portfolio_Checklist.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w7-l2',
      title: 'Launching your website - Deployment',
      isFreePreview: false,
      notes: 'Take your website live! Learn how to deploy and host your site for the world to see.',
      mainVideo: mainVideo(
        'Launching your website - Deployment',
        'https://www.youtube.com/watch?v=zEb7fXZd_zA'
      ),
      sessionVideos: [
        sessionVideo('2.1 - The three main components needed for a website to go live', 'https://www.youtube.com/watch?v=ZiWcqB3BheU', '04:00'),
        sessionVideo('2.2 - How do we set up a hosting server?', 'https://www.youtube.com/watch?v=ZBNRCu6Lz1g', '10:00'),
        sessionVideo('2.3 - Why is it not recommended to host your own website?', 'https://www.youtube.com/watch?v=UEzNQJEH-7c', '06:00'),
        sessionVideo('2.4 - How to choose the best web hosting plan according to your needs', 'https://www.youtube.com/watch?v=XoVeIqVBwQg', '17:00'),
        sessionVideo('2.5 - Accessing and exchanging website files with your hosting server', 'https://www.youtube.com/watch?v=ZxIHrXF_0dw', '15:00'),
        sessionVideo('2.6 - Launching your website', 'https://www.youtube.com/watch?v=1FFPtFthmTQ', '12:00'),
      ],
      resources: [
        resource('Deployment_Guide.pdf', 'pdf'),
      ],
    }),

    createLesson({
      id: 'p1-w7-l3',
      title: 'Deployment Demo: Deploying Website Using Square Space & Hostinger',
      isFreePreview: false,
      notes: 'Live demonstration of deploying a real website using popular hosting platforms.',
      mainVideo: mainVideo(
        'Deployment Demo: Deploying Website Using Square Space & Hostinger',
        'https://youtu.be/-qAs4XyFDl8?si=GdLNK6yHq__pY2pb'
      ),
      sessionVideos: [],
      resources: [
        resource('Deployment_Demo_Notes.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_07;