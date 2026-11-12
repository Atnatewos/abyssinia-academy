/**
 * @fileoverview Weeks Controller
 *
 * HTTP handlers for week management. Same structure as phases: thin
 * controllers, service does the work, global handler does the errors.
 *
 * Path: apps/api/src/controllers/weeks.controller.js
 */

const weekService = require('../services/week.service');

/* ============================================================================
 * GET /api/admin/phases/:phaseId/weeks
 * ============================================================================ */

const listWeeks = async (req, res, next) => {
  try {
    const { phaseId } = req.params;
    const weeks = await weekService.getWeeksByPhaseId(phaseId, {
      includeUnpublished: true,
    });
    res.json({
      success: true,
      data: { weeks },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * GET /api/admin/weeks/:id
 * ============================================================================ */

const getWeek = async (req, res, next) => {
  try {
    const { id } = req.params;
    const week = await weekService.getWeekById(id);
    res.json({
      success: true,
      data: { week },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * POST /api/admin/phases/:phaseId/weeks
 * ============================================================================ */

const createWeek = async (req, res, next) => {
  try {
    const { phaseId } = req.params;
    const week = await weekService.createWeek(phaseId, req.body);
    res.status(201).json({
      success: true,
      message: 'Week created successfully.',
      data: { week },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * PATCH /api/admin/weeks/:id
 * ============================================================================ */

const updateWeek = async (req, res, next) => {
  try {
    const { id } = req.params;
    const week = await weekService.updateWeek(id, req.body);
    res.json({
      success: true,
      message: 'Week updated successfully.',
      data: { week },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * DELETE /api/admin/weeks/:id
 * ============================================================================ */

const deleteWeek = async (req, res, next) => {
  try {
    const { id } = req.params;
    await weekService.deleteWeek(id);
    res.json({
      success: true,
      message: 'Week deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * PATCH /api/admin/weeks/:id/publish
 * ============================================================================ */

const setPublishState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const week = await weekService.setPublishState(id, isPublished);
    res.json({
      success: true,
      message: `Week ${isPublished ? 'published' : 'unpublished'} successfully.`,
      data: { week },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listWeeks,
  getWeek,
  createWeek,
  updateWeek,
  deleteWeek,
  setPublishState,
};