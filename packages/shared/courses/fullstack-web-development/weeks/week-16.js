/**
 * @fileoverview Week 16: Working with Databases - MySql
 * Phase 3 - Node, Express, MySql and React.js
 * Path: packages/shared/courses/fullstack-web-development/weeks/week-16.js
 */
const { createLesson, mainVideo, sessionVideo, resource } = require('../shared/helpers');

const WEEK_16 = {
  number: 16,
  phaseNumber: 3,
  title: 'Working with Databases - MySql',
  lessons: [
    createLesson({
      id: 'p3-w16-l1',
      title: 'Working with databases (MySql part I)',
      isFreePreview: false,
      notes: 'Understand relational vs non-relational databases, HTTP verbs, and how to connect Node.js to a MySQL database using SQL queries.',
      mainVideo: mainVideo(
        'Working with databases - MySql part I',
        'https://www.youtube.com/watch?v=zZMQlaGka6A'
      ),
      sessionVideos: [
        sessionVideo('1.1 - Introduction: database and database management system (DBMS)', 'https://www.youtube.com/watch?v=cVm3ZoM9_g8', '12:00'),
        sessionVideo('1.2 - Main categories of database: relational and non-relational database', 'https://www.youtube.com/watch?v=og6rx6oElCE', '26:00'),
        sessionVideo('1.3 - Working with databases using NodeJS: http verb', 'https://www.youtube.com/watch?v=FVO6Wtrcoxw', '07:00'),
        sessionVideo('1.4 - Working with databases using NodeJS: SQL query and MySQL database', 'https://www.youtube.com/watch?v=_oYe5e6c2Gg', '13:00'),
        sessionVideo('1.5 - Working with databases using NodeJS: MySQL driver and connecting with MySQL database using Node', 'https://www.youtube.com/watch?v=SxI18sioNsg', '21:00'),
        sessionVideo('1.6 - Working with databases using NodeJS: most commonly used SQL queries (create)', 'https://www.youtube.com/watch?v=UPlPpfeHQzE', '24:00'),
      ],
      resources: [
        resource('MySQL_Basics_Guide.pdf', 'pdf'),
      ],
    }),
    createLesson({
      id: 'p3-w16-l2',
      title: 'Working with databases (MySql part II)',
      isFreePreview: false,
      notes: 'Master the most commonly used SQL queries: INSERT, SELECT, UPDATE, and DELETE using Node.js and MySQL.',
      mainVideo: mainVideo(
        'Working with databases - MySQL part II',
        'https://www.youtube.com/watch?v=wg0ga_p3jtk'
      ),
      sessionVideos: [
        sessionVideo('2.1 - Working with databases using NodeJS: most commonly used SQL queries (insert)', 'https://www.youtube.com/watch?v=irZgpPN5ruI', '37:00'),
        sessionVideo('2.2 - Working with databases using NodeJS: most commonly used SQL queries (select)', 'https://www.youtube.com/watch?v=Y6MFpDNPmo4', '28:00'),
        sessionVideo('2.3 - Working with databases using NodeJS: most commonly used SQL queries (update and delete)', 'https://www.youtube.com/watch?v=FWuAyvCIYsE', '04:00'),
      ],
      resources: [
        resource('SQL_Queries_CheatSheet.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_16;