/**
 * @fileoverview Progress Database Queries
 * Student learning progress tracking
 * Path: apps/api/src/database/queries/progress.js
 */

const { query } = require('../pool');

/**
 * Get user's completed lessons
 * @param {string} userId - User UUID
 * @returns {Array} Completed lesson IDs
 */
const getCompletedLessons = async (userId) => {
  const result = await query(
    'SELECT lesson_id FROM completed_lessons WHERE user_id = $1',
    [userId]
  );
  return result.rows.map(row => row.lesson_id);
};

/**
 * Mark a lesson as completed
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson UUID
 * @returns {object} Completed lesson record
 */
const markLessonComplete = async (userId, lessonId) => {
  const result = await query(
    `INSERT INTO completed_lessons (user_id, lesson_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, lesson_id) DO NOTHING
     RETURNING *`,
    [userId, lessonId]
  );
  return result.rows[0];
};

/**
 * Unmark a lesson as completed
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson UUID
 * @returns {object} Deletion result
 */
const unmarkLessonComplete = async (userId, lessonId) => {
  await query(
    'DELETE FROM completed_lessons WHERE user_id = $1 AND lesson_id = $2',
    [userId, lessonId]
  );
  return { removed: true };
};

/**
 * Get user's course progress
 * @param {string} userId - User UUID
 * @param {string} courseId - Course UUID
 * @returns {object|null} Progress record
 */
const getCourseProgress = async (userId, courseId) => {
  const result = await query(
    'SELECT * FROM course_progress WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  return result.rows[0] || null;
};

/**
 * Update course progress percentage
 * @param {string} userId - User UUID
 * @param {string} courseId - Course UUID
 * @param {number} progress - Progress percentage
 * @returns {object} Updated progress
 */
const updateCourseProgress = async (userId, courseId, progress) => {
  const result = await query(
    `INSERT INTO course_progress (user_id, course_id, progress)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, course_id)
     DO UPDATE SET progress = $3, updated_at = NOW()
     RETURNING *`,
    [userId, courseId, progress]
  );
  return result.rows[0];
};

/**
 * Get all user progress across courses
 * @param {string} userId - User UUID
 * @returns {Array} Progress list
 */
const getAllUserProgress = async (userId) => {
  const result = await query(
    `SELECT cp.*, c.title as course_title, c.slug as course_slug
     FROM course_progress cp
     JOIN courses c ON cp.course_id = c.id
     WHERE cp.user_id = $1`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  getCompletedLessons,
  markLessonComplete,
  unmarkLessonComplete,
  getCourseProgress,
  updateCourseProgress,
  getAllUserProgress,
};