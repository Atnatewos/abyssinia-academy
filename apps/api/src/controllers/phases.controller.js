/**
 * @fileoverview Phases Controller
 *
 * HTTP handlers for phase management. Every handler:
 *   1. Extracts the minimum needed from req (params/body/query)
 *   2. Calls a single phase.service method
 *   3. Returns a consistent JSON envelope
 *
 * Errors are always forwarded to next() so the global error handler
 * produces the correct status code — controllers never build error
 * responses themselves.
 *
 * Response envelope:
 *   Success → { success: true, data: { phase } } or { success: true, data: { phases } }
 *   Error   → handled by globalErrorHandler (ApiError subclass → status + message)
 *
 * Path: apps/api/src/controllers/phases.controller.js
 */

const phaseService = require('../services/phase.service');

/* ============================================================================
 * GET /api/admin/courses/:courseId/phases
 * ============================================================================ */

/**
 * List all phases for a course (admin — includes drafts).
 */
const listPhases = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const phases = await phaseService.getPhasesByCourseId(courseId, {
      includeUnpublished: true,
    });
    res.json({
      success: true,
      data: { phases },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * GET /api/admin/phases/:id
 * ============================================================================ */

/**
 * Fetch a single phase with outcomes attached.
 */
const getPhase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const phase = await phaseService.getPhaseById(id);
    res.json({
      success: true,
      data: { phase },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * POST /api/admin/courses/:courseId/phases
 * ============================================================================ */

/**
 * Create a phase under a course. When `phaseNumber` is omitted, the next
 * free number is assigned by the service.
 */
const createPhase = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const phase = await phaseService.createPhase(courseId, req.body);
    res.status(201).json({
      success: true,
      message: 'Phase created successfully.',
      data: { phase },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * PATCH /api/admin/phases/:id
 * ============================================================================ */

/**
 * Update a phase. Only fields present in the payload are changed; fields
 * sent as null are cleared.
 */
const updatePhase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const phase = await phaseService.updatePhase(id, req.body);
    res.json({
      success: true,
      message: 'Phase updated successfully.',
      data: { phase },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * DELETE /api/admin/phases/:id
 * ============================================================================ */

/**
 * Delete a phase. Cascades to weeks/lessons at the DB level.
 */
const deletePhase = async (req, res, next) => {
  try {
    const { id } = req.params;
    await phaseService.deletePhase(id);
    res.json({
      success: true,
      message: 'Phase deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * PATCH /api/admin/phases/:id/publish
 * ============================================================================ */

/**
 * Toggle a phase's publish state. Body: { isPublished: boolean }.
 */
const setPublishState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const phase = await phaseService.setPublishState(id, isPublished);
    res.json({
      success: true,
      message: `Phase ${isPublished ? 'published' : 'unpublished'} successfully.`,
      data: { phase },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPhases,
  getPhase,
  createPhase,
  updatePhase,
  deletePhase,
  setPublishState,
};