/**
 * @fileoverview Progress Service
 * Business logic for student learning progress
 * Path: apps/api/src/services/progress.service.js
 */

const progressDb = require('../database/queries/progress');
const coursesDb = require('../database/queries/courses');
const { NotFoundError } = require('../utils/errors');

/**
 * Get student's completed lessons for a course
 * @param {string} userId - User UUID
 * @returns {Array} Completed lesson IDs
 */
const getCompletedLessons = async (userId) => {
  const completedLessons = await progressDb.getCompletedLessons(userId);
  return completedLessons;
};

/**
 * Toggle lesson completion status
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson UUID
 * @returns {object} Updated completion status
 */
const toggleLessonCompletion = async (userId, lessonId) => {
  const completedLessons = await progressDb.getCompletedLessons(userId);
  const isCompleted = completedLessons.includes(lessonId);

  if (isCompleted) {
    await progressDb.unmarkLessonComplete(userId, lessonId);
    return { completed: false };
  } else {
    await progressDb.markLessonComplete(userId, lessonId);
    return { completed: true };
  }
};

/**
 * Calculate and update course progress percentage
 * @param {string} userId - User UUID
 * @param {string} courseId - Course UUID
 * @returns {number} Progress percentage
 */
const calculateCourseProgress = async (userId, courseId) => {
  // Get total lessons in the course
  const curriculum = await coursesDb.getFullCurriculum(courseId);
  let totalLessons = 0;
  
  for (const phase of curriculum) {
    for (const week of (phase.weeks || [])) {
      totalLessons += (week.lessons || []).length;
    }
  }

  if (totalLessons === 0) return 0;

  // Get completed lessons
  const completedLessons = await progressDb.getCompletedLessons(userId);
  
  // Get all lesson IDs from the course
  const courseLessonIds = [];
  for (const phase of curriculum) {
    for (const week of (phase.weeks || [])) {
      for (const lesson of (week.lessons || [])) {
        courseLessonIds.push(lesson.id);
      }
    }
  }

  // Count completed lessons that belong to this course
  const completedInCourse = courseLessonIds.filter(id => completedLessons.includes(id));
  const progress = Math.round((completedInCourse.length / totalLessons) * 100);

  // Save progress
  await progressDb.updateCourseProgress(userId, courseId, progress);

  return progress;
};

/**
 * Get user's progress for all courses
 * @param {string} userId - User UUID
 * @returns {Array} Progress list
 */
const getAllUserProgress = async (userId) => {
  const progress = await progressDb.getAllUserProgress(userId);
  return progress;
};

module.exports = {
  getCompletedLessons,
  toggleLessonCompletion,
  calculateCourseProgress,
  getAllUserProgress,
};