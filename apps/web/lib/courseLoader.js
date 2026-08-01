/**
 * @fileoverview Course Loader Bridge
 * Bridges the monorepo gap between Next.js webpack and shared packages
 * Uses CommonJS require() which Next.js handles better than ESM import
 * Path: apps/web/lib/courseLoader.js
 */

let CourseLoader = null;

try {
  const path = require('path');
  const coursesPath = path.resolve(__dirname, '..', '..', '..', 'packages', 'shared', 'courses');
  CourseLoader = require(coursesPath);
  console.log('✅ CourseLoader loaded successfully');
  console.log('📚 Available courses:', CourseLoader.getAll('en').map(c => c.slug));
} catch (error) {
  console.error('❌ Failed to load CourseLoader:', error.message);
  CourseLoader = {
    getAll: () => [],
    getBySlug: () => null,
    getById: () => null,
  };
}

export default CourseLoader;