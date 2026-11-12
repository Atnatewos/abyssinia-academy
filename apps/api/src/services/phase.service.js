/**
 * @fileoverview Phase Service
 *
 * Business rules for phase management:
 *   - Phase numbers are auto-assigned on create when not supplied
 *   - Phase numbers are unique per course (validated before insert)
 *   - Price must be a non-negative number when provided
 *   - Publish flips are idempotent (setting the same state is a no-op)
 *
 * All validation errors throw typed errors so the global error handler
 * returns correct HTTP status codes.
 *
 * Path: apps/api/src/services/phase.service.js
 */

const phasesDb = require('../database/queries/phases');
const coursesDb = require('../database/queries/courses');
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require('../utils/errors');

/* ============================================================================
 * VALIDATION
 * ============================================================================ */

/**
 * Validate and normalize a phase write payload.
 * @param {object} body - Raw request body
 * @param {object} options
 * @param {boolean} options.partial - Allow missing required fields (update mode)
 * @returns {object} Normalized payload
 * @throws {BadRequestError}
 */
const normalizePhasePayload = (body, { partial }) => {
  const allowed = [
    'phaseNumber',
    'title',
    'titleAm',
    'subtitle',
    'subtitleAm',
    'description',
    'descriptionAm',
    'color',
    'duration',
    'icon',
    'priceEtb',
    'isPublished',
    'orderIndex',
    'outcomes',
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

  if (!partial || body.subtitle !== undefined) {
    if (!body.subtitle || typeof body.subtitle !== 'string') {
      throw new BadRequestError('subtitle is required and must be a string.');
    }
    payload.subtitle = body.subtitle.trim();
  }

  if (!partial || body.description !== undefined) {
    if (!body.description || typeof body.description !== 'string') {
      throw new BadRequestError(
        'description is required and must be a string.'
      );
    }
    payload.description = body.description.trim();
  }

  if (!partial || body.duration !== undefined) {
    if (!body.duration || typeof body.duration !== 'string') {
      throw new BadRequestError('duration is required and must be a string.');
    }
    payload.duration = body.duration.trim();
  }

  for (const field of ['titleAm', 'subtitleAm', 'descriptionAm', 'color', 'icon']) {
    if (body[field] !== undefined) {
      payload[field] =
        body[field] === null ? null : String(body[field]).trim() || null;
    }
  }

  if (body.phaseNumber !== undefined) {
    const num = Number(body.phaseNumber);
    if (!Number.isInteger(num) || num <= 0) {
      throw new BadRequestError(
        'phaseNumber must be a positive integer.'
      );
    }
    payload.phaseNumber = num;
  }

  if (body.priceEtb !== undefined) {
    if (body.priceEtb === null) {
      payload.priceEtb = null;
    } else {
      const num = Number(body.priceEtb);
      if (!Number.isFinite(num) || num < 0) {
        throw new BadRequestError(
          'priceEtb must be a non-negative number or null.'
        );
      }
      payload.priceEtb = Math.round(num * 100) / 100;
    }
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

  if (body.outcomes !== undefined) {
    if (!Array.isArray(body.outcomes)) {
      throw new BadRequestError('outcomes must be an array of strings.');
    }
    payload.outcomes = body.outcomes.map((o, i) => {
      if (typeof o !== 'string' || o.trim() === '') {
        throw new BadRequestError(
          `outcomes[${i}] must be a non-empty string.`
        );
      }
      return o.trim();
    });
  }

  return payload;
};

/* ============================================================================
 * QUERIES
 * ============================================================================ */

/**
 * Fetch a phase by ID with outcomes.
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError}
 */
const getPhaseById = async (id) => {
  const phase = await phasesDb.getPhaseWithOutcomes(id);
  if (!phase) {
    throw new NotFoundError('Phase not found.');
  }
  return phase;
};

/**
 * List phases for a course.
 * @param {string} courseId
 * @param {object} [options]
 * @param {boolean} [options.includeUnpublished=false]
 * @returns {Promise<Array>}
 * @throws {NotFoundError} When the course does not exist
 */
const getPhasesByCourseId = async (courseId, options = {}) => {
  const course = await coursesDb.getCourseById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found.');
  }
  return phasesDb.getPhasesByCourseId(courseId, options);
};

/* ============================================================================
 * MUTATIONS
 * ============================================================================ */

/**
 * Create a phase under a course.
 *
 * When `phaseNumber` is not supplied, the next free number is assigned
 * automatically. When it is supplied, uniqueness within the course is
 * enforced with a 409.
 *
 * @param {string} courseId
 * @param {object} body
 * @returns {Promise<object>}
 * @throws {NotFoundError|ConflictError|BadRequestError}
 */
const createPhase = async (courseId, body) => {
  const course = await coursesDb.getCourseById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found.');
  }

  const payload = normalizePhasePayload(body, { partial: false });

  let phaseNumber = payload.phaseNumber;
  if (phaseNumber === undefined) {
    phaseNumber = await phasesDb.getNextPhaseNumber(courseId);
  } else {
    const exists = await phasesDb.phaseNumberExists(courseId, phaseNumber);
    if (exists) {
      throw new ConflictError(
        `Phase number ${phaseNumber} is already used in this course.`
      );
    }
  }

  return phasesDb.createPhase({
    ...payload,
    phaseNumber,
    courseId,
  });
};

/**
 * Update a phase. When phaseNumber changes, uniqueness is re-validated.
 *
 * @param {string} id
 * @param {object} body
 * @returns {Promise<object>}
 * @throws {NotFoundError|ConflictError|BadRequestError}
 */
const updatePhase = async (id, body) => {
  const existing = await phasesDb.getPhaseById(id);
  if (!existing) {
    throw new NotFoundError('Phase not found.');
  }

  const payload = normalizePhasePayload(body, { partial: true });

  if (
    payload.phaseNumber !== undefined &&
    payload.phaseNumber !== existing.phase_number
  ) {
    const exists = await phasesDb.phaseNumberExists(
      existing.course_id,
      payload.phaseNumber,
      id
    );
    if (exists) {
      throw new ConflictError(
        `Phase number ${payload.phaseNumber} is already used in this course.`
      );
    }
  }

  const updated = await phasesDb.updatePhase(id, payload);
  if (!updated) {
    throw new NotFoundError('Phase not found.');
  }
  return updated;
};

/**
 * Delete a phase. Cascades to weeks/lessons at the DB level.
 * @param {string} id
 * @returns {Promise<{ deleted: boolean }>}
 * @throws {NotFoundError}
 */
const deletePhase = async (id) => {
  const deleted = await phasesDb.deletePhase(id);
  if (!deleted) {
    throw new NotFoundError('Phase not found.');
  }
  return { deleted: true };
};

/**
 * Toggle publish state. Idempotent — setting the current state is a no-op
 * on the DB but still returns the row.
 *
 * @param {string} id
 * @param {boolean} isPublished
 * @returns {Promise<object>}
 * @throws {NotFoundError}
 */
const setPublishState = async (id, isPublished) => {
  if (typeof isPublished !== 'boolean') {
    throw new BadRequestError('isPublished must be a boolean.');
  }
  const updated = await phasesDb.setPhasePublishState(id, isPublished);
  if (!updated) {
    throw new NotFoundError('Phase not found.');
  }
  return updated;
};

module.exports = {
  getPhaseById,
  getPhasesByCourseId,
  createPhase,
  updatePhase,
  deletePhase,
  setPublishState,
};