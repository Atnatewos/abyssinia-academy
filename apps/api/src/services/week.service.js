/**
 * @fileoverview Week Service
 *
 * Business rules for week management:
 *   - Weeks belong to a phase; the phase must exist
 *   - Week numbers are unique per phase
 *   - When no week number is supplied, the next free number is assigned
 *   - Publish flips are idempotent
 *
 * Path: apps/api/src/services/week.service.js
 */

const weeksDb = require('../database/queries/weeks');
const phasesDb = require('../database/queries/phases');
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require('../utils/errors');

/* ============================================================================
 * VALIDATION
 * ============================================================================ */

/**
 * Validate and normalize a week write payload.
 * @param {object} body
 * @param {object} options
 * @param {boolean} options.partial
 * @returns {object}
 */
const normalizeWeekPayload = (body, { partial }) => {
  const allowed = [
    'weekNumber',
    'title',
    'titleAm',
    'isPublished',
    'orderIndex',
  ];

  const unknown = Object.keys(body).filter((k) => !allowed.includes(k));
  if (unknown.length > 0) {
    throw new BadRequestError(
      `Unknown field(s) in request: ${unknown.join(', ')}`
    );
  }

  const payload = {};

  if (!partial || body.title !== undefined) {
    if (!body.title || typeof body.title !== 'string') {
      throw new BadRequestError('title is required and must be a string.');
    }
    payload.title = body.title.trim();
  }

  if (body.titleAm !== undefined) {
    payload.titleAm =
      body.titleAm === null ? null : String(body.titleAm).trim() || null;
  }

  if (body.weekNumber !== undefined) {
    const num = Number(body.weekNumber);
    if (!Number.isInteger(num) || num <= 0) {
      throw new BadRequestError('weekNumber must be a positive integer.');
    }
    payload.weekNumber = num;
  }

  if (body.isPublished !== undefined) {
    payload.isPublished = Boolean(body.isPublished);
  }

  if (body.orderIndex !== undefined) {
    const idx = Number(body.orderIndex);
    if (!Number.isInteger(idx) || idx < 0) {
      throw new BadRequestError(
        'orderIndex must be a non-negative integer.'
      );
    }
    payload.orderIndex = idx;
  }

  return payload;
};

/* ============================================================================
 * QUERIES
 * ============================================================================ */

/**
 * Fetch a week by ID.
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError}
 */
const getWeekById = async (id) => {
  const week = await weeksDb.getWeekById(id);
  if (!week) {
    throw new NotFoundError('Week not found.');
  }
  return week;
};

/**
 * List weeks for a phase.
 * @param {string} phaseId
 * @param {object} [options]
 * @returns {Promise<Array>}
 * @throws {NotFoundError}
 */
const getWeeksByPhaseId = async (phaseId, options = {}) => {
  const phase = await phasesDb.getPhaseById(phaseId);
  if (!phase) {
    throw new NotFoundError('Phase not found.');
  }
  return weeksDb.getWeeksByPhaseId(phaseId, options);
};

/* ============================================================================
 * MUTATIONS
 * ============================================================================ */

/**
 * Create a week under a phase.
 * @param {string} phaseId
 * @param {object} body
 * @returns {Promise<object>}
 * @throws {NotFoundError|ConflictError|BadRequestError}
 */
const createWeek = async (phaseId, body) => {
  const phase = await phasesDb.getPhaseById(phaseId);
  if (!phase) {
    throw new NotFoundError('Phase not found.');
  }

  const payload = normalizeWeekPayload(body, { partial: false });

  let weekNumber = payload.weekNumber;
  if (weekNumber === undefined) {
    weekNumber = await weeksDb.getNextWeekNumber(phaseId);
  } else {
    const exists = await weeksDb.weekNumberExists(phaseId, weekNumber);
    if (exists) {
      throw new ConflictError(
        `Week number ${weekNumber} is already used in this phase.`
      );
    }
  }

  return weeksDb.createWeek({
    ...payload,
    weekNumber,
    phaseId,
  });
};

/**
 * Update a week.
 * @param {string} id
 * @param {object} body
 * @returns {Promise<object>}
 * @throws {NotFoundError|ConflictError|BadRequestError}
 */
const updateWeek = async (id, body) => {
  const existing = await weeksDb.getWeekById(id);
  if (!existing) {
    throw new NotFoundError('Week not found.');
  }

  const payload = normalizeWeekPayload(body, { partial: true });

  if (
    payload.weekNumber !== undefined &&
    payload.weekNumber !== existing.week_number
  ) {
    const exists = await weeksDb.weekNumberExists(
      existing.phase_id,
      payload.weekNumber,
      id
    );
    if (exists) {
      throw new ConflictError(
        `Week number ${payload.weekNumber} is already used in this phase.`
      );
    }
  }

  const updated = await weeksDb.updateWeek(id, payload);
  if (!updated) {
    throw new NotFoundError('Week not found.');
  }
  return updated;
};

/**
 * Delete a week. Cascades to lessons at the DB level.
 * @param {string} id
 * @returns {Promise<{ deleted: boolean }>}
 */
const deleteWeek = async (id) => {
  const deleted = await weeksDb.deleteWeek(id);
  if (!deleted) {
    throw new NotFoundError('Week not found.');
  }
  return { deleted: true };
};

/**
 * Toggle publish state.
 * @param {string} id
 * @param {boolean} isPublished
 * @returns {Promise<object>}
 */
const setPublishState = async (id, isPublished) => {
  if (typeof isPublished !== 'boolean') {
    throw new BadRequestError('isPublished must be a boolean.');
  }
  const updated = await weeksDb.setWeekPublishState(id, isPublished);
  if (!updated) {
    throw new NotFoundError('Week not found.');
  }
  return updated;
};

module.exports = {
  getWeekById,
  getWeeksByPhaseId,
  createWeek,
  updateWeek,
  deleteWeek,
  setPublishState,
};