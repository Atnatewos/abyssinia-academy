const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_04 = {
  number: 4, phaseNumber: 1,
  title: 'Responsive Design & CSS Architecture',
  lessons: [
    createLesson({
      id: 'p1-w4-l1',
      title: 'Mobile-First Responsive Design Patterns',
      duration: '45 mins',
      notes: 'Build websites that look perfect on every screen size.',
      mainVideo: mainVideo('Full Lecture: Responsive Design', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ'),
      sessionVideos: [
        sessionVideo('01. Viewport & Media Queries', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '00:00'),
        sessionVideo('02. Fluid Typography & Spacing', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '16:00'),
        sessionVideo('03. Responsive Images & Performance', 'https://www.youtube.com/watch?v=2KL-z9UZ6gQ', '30:00'),
      ],
      resources: [resource('Responsive_Checklist.pdf', 'pdf')],
    }),
  ],
};

module.exports = WEEK_04;