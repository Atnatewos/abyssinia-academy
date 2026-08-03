/**
 * @fileoverview Week 14: Introduction to Bash Script, Git and Node.js
 * Phase 3 - Node, Express, MySql and React.js
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-14.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_14 = {
  number: 14,
  phaseNumber: 3,
  title: 'Introduction to Bash Script, Git and Node.js',
  lessons: [
    createLesson({
      id: 'p3-w14-l1',
      title: 'Introduction to terminal, Bash Script and Git',
      isFreePreview: true,
      notes: 'Master the command line, essential Bash commands, and the fundamentals of version control with Git and GitHub.',
      mainVideo: mainVideo(
        'Introduction to terminal, Bash Script and Git',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction to phase 3', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Bash script: Mac terminal, Git Bash and Cygwin', 'PLACEHOLDER_YOUTUBE_ID', '06:00'),
        sessionVideo('1.3 - The main Bash commands you have to know', 'PLACEHOLDER_YOUTUBE_ID', '22:00'),
        sessionVideo('1.4 - Introduction to Git: what is Git?', 'PLACEHOLDER_YOUTUBE_ID', '52:00'),
        sessionVideo('1.5 - Why do we use Git and GitHub? How do we create a repository on GitHub?', 'PLACEHOLDER_YOUTUBE_ID', '01:01:00'),
        sessionVideo('1.6 - Git workflow: cloning, editing, committing and pushing', 'PLACEHOLDER_YOUTUBE_ID', '01:16:00'),
        sessionVideo('1.7 - Git workflow: forking, sending pull request and merging', 'PLACEHOLDER_YOUTUBE_ID', '01:28:00'),
      ],
      resources: [
        resource('Bash_Commands_CheatSheet.pdf', 'pdf'),
        resource('Git_Workflow_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p3-w14-l2',
      title: 'Introduction to Node.js',
      isFreePreview: false,
      notes: 'Understand how web servers work, the difference between static and dynamic pages, and the inception of Node.js non-blocking architecture.',
      mainVideo: mainVideo(
        'Introduction to Node.js',
        'PLACEHOLDER_YOUTUBE_ID'
      ),
      sessionVideos: [
        sessionVideo('2.1 - How does a local static web page work?', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - How does a remote static web page work? Requesting/receiving data from remote computer', 'PLACEHOLDER_YOUTUBE_ID', '11:00'),
        sessionVideo('2.3 - How does a remote static web page work? Browser getting content of the file using TCP/IP layers', 'PLACEHOLDER_YOUTUBE_ID', '22:00'),
        sessionVideo('2.4 - How does a local dynamic web page work?', 'PLACEHOLDER_YOUTUBE_ID', '46:00'),
        sessionVideo('2.5 - Concurrent HTTP requests and synchronous/blocking architecture', 'PLACEHOLDER_YOUTUBE_ID', '58:00'),
        sessionVideo('2.6 - Inception of NodeJS: non-blocking/asynchronous architecture', 'PLACEHOLDER_YOUTUBE_ID', '01:11:00'),
      ],
      resources: [
        resource('NodeJS_Introduction.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_14;