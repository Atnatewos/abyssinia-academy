/**
 * @fileoverview Week 1: HTML5 Semantics & Web Mechanics
 * Phase 1 - Foundations of Modern Web Architecture
 *
 * Each lesson has:
 * - title: The class name shown in the accordion
 * - mainVideo: The full live session recording
 * - sessionVideos: Individual session-by-session breakdowns
 *   Each session MUST have a UNIQUE youtubeId for proper highlighting
 *
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-01.js
 */

const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_01 = {
  number: 1,
  phaseNumber: 1,
  title: 'Basic Computer Skills',

  lessons: [

    createLesson({
      id: 'p1-w1-l1',
      title: 'Basic computer skills - part I',
      isFreePreview: true,
      notes: 'How HTTP requests flow and how semantic HTML tags help SEO and accessibility.',
      mainVideo: mainVideo(
        'Basic computer skills - part I',
        'https://www.youtube.com/watch?v=s6kPODxyRfg'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Understanding your operating system', 'https://www.youtube.com/watch?v=n07syTP6hCc', '00:00'),
        sessionVideo('1.2 - Understanding folders, files and applications', 'https://www.youtube.com/watch?v=9fvjDMsuFWs', '14:20'),
        sessionVideo('1.3 - Compressing (zipping) and decompressing (unzipping)', 'https://www.youtube.com/watch?v=dGdilLXLWdk', '30:15'),
      ],
      resources: [
        resource('HTML5_CheatSheet.pdf', 'pdf'),
        resource('Semantic_Starter.zip', 'zip'),
      ],
    }),

    createLesson({
      id: 'p1-w1-l2',
      title: 'Basic computer skills - part II',
      isFreePreview: true,
      notes: 'Master clean user input handling before diving into frontend state frameworks.',
      mainVideo: mainVideo(
        'Basic computer skills - part II',
        'https://www.youtube.com/watch?v=BbUA9nYonwU'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Specializing on web related files as a web developer', 'https://www.youtube.com/watch?v=LnJ9MKXhsSo', '12:00'),
        sessionVideo('2.2 - Understanding Visual Studio Code (VSC)', 'https://www.youtube.com/watch?v=0jzVK_kmHdU', '10:00'),
        sessionVideo('2.3 - Understanding your browser (Chrome)', 'https://www.youtube.com/watch?v=k3hK5GUeob4', '04:00'),
        sessionVideo('2.4 - Quick revision and improving google search skill', 'https://www.youtube.com/watch?v=OhGOLv8EzR0', '04:00'),
      ],
      resources: [
        resource('Form_Validation_Guide.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_01;