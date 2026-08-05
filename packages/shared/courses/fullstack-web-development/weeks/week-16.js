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
        sessionVideo('1.1 - Introduction: database and database management system (DBMS)', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('1.2 - Main categories of database: relational and non-relational database', 'PLACEHOLDER_YOUTUBE_ID', '12:00'),
        sessionVideo('1.3 - Working with databases using NodeJS: http verb', 'PLACEHOLDER_YOUTUBE_ID', '38:00'),
        sessionVideo('1.4 - Working with databases using NodeJS: SQL query and MySQL database', 'PLACEHOLDER_YOUTUBE_ID', '45:00'),
        sessionVideo('1.5 - Working with databases using NodeJS: MySQL driver and connecting with MySQL database using Node', 'PLACEHOLDER_YOUTUBE_ID', '58:00'),
        sessionVideo('1.6 - Working with databases using NodeJS: most commonly used SQL queries (create)', 'PLACEHOLDER_YOUTUBE_ID', '01:19:00'),
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
        sessionVideo('2.1 - Working with databases using NodeJS: most commonly used SQL queries (insert)', 'PLACEHOLDER_YOUTUBE_ID', '00:00'),
        sessionVideo('2.2 - Working with databases using NodeJS: most commonly used SQL queries (select)', 'PLACEHOLDER_YOUTUBE_ID', '37:00'),
        sessionVideo('2.3 - Working with databases using NodeJS: most commonly used SQL queries (update and delete)', 'PLACEHOLDER_YOUTUBE_ID', '01:05:00'),
      ],
      resources: [
        resource('SQL_Queries_CheatSheet.pdf', 'pdf'),
      ],
    }),
  ],
};

module.exports = WEEK_16;