/**
 * @fileoverview Course Aggregator & Loader
 * Path: packages/shared/courses/index.js
 */

const fullstackWebDev = require('./fullstack-web-development/course');

const ALL_COURSES = [fullstackWebDev];

const CourseLoader = {
  getAll() {
    return ALL_COURSES.filter((c) => c.meta && c.meta.isPublished);
  },

  getBySlug(slug) {
    return ALL_COURSES.find((c) => c.slug === slug) || null;
  },

  getById(id) {
    return ALL_COURSES.find((c) => c.id === id) || null;
  },
};

module.exports = CourseLoader;