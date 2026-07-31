/**
 * @fileoverview Progress Controller
 * Request handlers for student progress routes
 * Path: apps/api/src/controllers/progress.controller.js
 */

const progressService = require('../services/progress.service');
const coursesDb = require('../database/queries/courses');

/**
 * GET /api/progress/completed
 * Get user's completed lesson IDs
 */
const getCompletedLessons = async (req, res, next) => {
  try {
    const completedLessons = await progressService.getCompletedLessons(req.user.id);

    res.json({
      success: true,
      data: { completedLessons },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/progress/lessons/:lessonId/toggle
 * Toggle lesson completion status
 */
const toggleLessonCompletion = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const result = await progressService.toggleLessonCompletion(req.user.id, lessonId);

    res.json({
      success: true,
      message: result.completed ? 'Lesson marked as complete.' : 'Lesson marked as incomplete.',
      data: { completed: result.completed },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/progress/courses/:courseId
 * Get course progress percentage
 */
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const progress = await progressService.calculateCourseProgress(req.user.id, courseId);

    res.json({
      success: true,
      data: { progress },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/progress/all
 * Get user's progress for all courses
 */
const getAllProgress = async (req, res, next) => {
  try {
    const progress = await progressService.getAllUserProgress(req.user.id);

    res.json({
      success: true,
      data: { progress },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompletedLessons,
  toggleLessonCompletion,
  getCourseProgress,
  getAllProgress,
};