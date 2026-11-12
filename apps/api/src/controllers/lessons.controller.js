/**
 * @fileoverview Lessons Controller
 *
 * HTTP handlers for lesson management. Same structure as phases/weeks.
 *
 * Lessons carry nested sessions and resources — those are provided as
 * arrays in the request body and fully replace the corresponding child
 * tables on update. See lesson.service.js for the exact shapes.
 *
 * Path: apps/api/src/controllers/lessons.controller.js
 */

const lessonService = require('../services/lesson.service');

/* ============================================================================
 * GET /api/admin/weeks/:weekId/lessons
 * ============================================================================ */

const listLessons = async (req, res, next) => {
  try {
    const { weekId } = req.params;
    const lessons = await lessonService.getLessonsByWeekId(weekId, {
      includeUnpublished: true,
    });
    res.json({
      success: true,
      data: { lessons },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * GET /api/admin/lessons/:id
 * ============================================================================ */

const getLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonById(id);
    res.json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * POST /api/admin/weeks/:weekId/lessons
 * ============================================================================ */

const createLesson = async (req, res, next) => {
  try {
    const { weekId } = req.params;
    const lesson = await lessonService.createLesson(weekId, req.body);
    res.status(201).json({
      success: true,
      message: 'Lesson created successfully.',
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * PATCH /api/admin/lessons/:id
 * ============================================================================ */

const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.updateLesson(id, req.body);
    res.json({
      success: true,
      message: 'Lesson updated successfully.',
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * DELETE /api/admin/lessons/:id
 * ============================================================================ */

const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    await lessonService.deleteLesson(id);
    res.json({
      success: true,
      message: 'Lesson deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * PATCH /api/admin/lessons/:id/publish
 * ============================================================================ */

const setPublishState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const lesson = await lessonService.setPublishState(id, isPublished);
    res.json({
      success: true,
      message: `Lesson ${isPublished ? 'published' : 'unpublished'} successfully.`,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  setPublishState,
};