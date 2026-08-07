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
      isFreePreview: false,
      notes: 'Master the command line, essential Bash commands, and the fundamentals of version control with Git and GitHub.',
      mainVideo: mainVideo(
        'Introduction to terminal, Bash Script and Git',
        'https://www.youtube.com/watch?v=KrJ7kiNB2Ys'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction to phase 3', 'https://www.youtube.com/watch?v=yD-GTjHUGBs', '06:00'),
        sessionVideo('1.2 - Bash script: Mac terminal, Git Bash and Cygwin', 'https://www.youtube.com/watch?v=a7UaMTn4VVw', '16:00'),
        sessionVideo('1.3 - The main Bash commands you have to know', 'https://www.youtube.com/watch?v=9HID-_7n42M', '30:00'),
        sessionVideo('1.4 - Introduction to Git: what is Git?', 'https://www.youtube.com/watch?v=iV87umbvWgA', '09:00'),
        sessionVideo('1.5 - Why do we use Git and GitHub? How do we create a repository on GitHub?', 'https://www.youtube.com/watch?v=WxCck_8qOII', '15:00'),
        sessionVideo('1.6 - Git workflow: cloning, editing, committing and pushing', 'https://www.youtube.com/watch?v=vwb5LAOE1p4', '12:00'),
        sessionVideo('1.7 - Git workflow: forking, sending pull request and merging', 'https://www.youtube.com/watch?v=g1iRc7RuOKw', '11:00'),
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
        'https://www.youtube.com/watch?v=QpV5tAkPUUQ'
      ),
      sessionVideos: [
        sessionVideo('2.1 - How does a local static web page work?', 'https://www.youtube.com/watch?v=phsVlWU2EK8', '11:00'),
        sessionVideo('2.2 - How does a remote static web page work? Requesting/receiving data from remote computer', 'https://www.youtube.com/watch?v=45QSlKRlAwg', '11:00'),
        sessionVideo('2.3 - How does a remote static web page work? Browser getting content of the file using TCP/IP layers', 'https://www.youtube.com/watch?v=Uq_YRPZRubc', '24:00'),
        sessionVideo('2.4 - How does a local dynamic web page work?', 'https://www.youtube.com/watch?v=UuoPPuzhdME', '12:00'),
        sessionVideo('2.5 - Concurrent HTTP requests and synchronous/blocking architecture', 'https://www.youtube.com/watch?v=T6OnPuZSufU', '13:00'),
        sessionVideo('2.6 - Inception of NodeJS: non-blocking/asynchronous architecture', 'https://www.youtube.com/watch?v=vF92b4vRj48', '11:00'),
      ],
      resources: [
        resource('NodeJS_Introduction.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_14;