/**
 * @fileoverview Lesson Service
 *
 * Business rules for lesson management:
 *   - Lessons belong to a week; the week must exist
 *   - YouTube IDs are normalized from any common YouTube URL format
 *   - Sessions are arrays of `{ name, time }`; time must look like MM:SS
 *     or HH:MM:SS
 *   - Resources are arrays of `{ name, type?, url? }`; type defaults to
 *     'pdf' and url is optional
 *   - Sessions and resources are FULL REPLACEMENTS on update
 *   - Publish flips are idempotent
 *
 * Path: apps/api/src/services/lesson.service.js
 */

const lessonsDb = require('../database/queries/lessons');
const weeksDb = require('../database/queries/weeks');
const {
  NotFoundError,
  BadRequestError,
} = require('../utils/errors');

/* ============================================================================
 * YOUTUBE ID NORMALIZATION
 * ============================================================================ */

/**
 * Extract an 11-character YouTube video ID from any common YouTube URL
 * format. If the input is already an 11-char ID, returns it unchanged.
 *
 * Handles:
 *   - Raw 11-char IDs
 *   - https://youtu.be/<id>
 *   - https://www.youtube.com/watch?v=<id>
 *   - https://www.youtube.com/embed/<id>
 *   - https://www.youtube.com/shorts/<id>
 *   - <iframe src="...embed/<id>...">  (extracts from src)
 *
 * @param {string} raw
 * @returns {string} 11-char ID
 * @throws {BadRequestError} When no valid ID can be extracted
 */
const normalizeYoutubeId = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new BadRequestError('youtubeId is required.');
  }

  const trimmed = raw.trim();

  // Already a valid 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Extract from any of the known URL forms
  const match = trimmed.match(
    /(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }

  // Extract from an iframe src attribute
  const iframeMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  throw new BadRequestError(
    'youtubeId must be an 11-character YouTube ID or a valid YouTube URL.'
  );
};

/* ============================================================================
 * VALIDATION
 * ============================================================================ */

/**
 * Validate and normalize a session payload.
 * @param {Array} sessions
 * @returns {Array<{ name: string, time: string }>}
 * @throws {BadRequestError}
 */
const normalizeSessions = (sessions) => {
  if (!Array.isArray(sessions)) {
    throw new BadRequestError('sessions must be an array.');
  }

  return sessions.map((s, i) => {
    if (!s || typeof s !== 'object') {
      throw new BadRequestError(`sessions[${i}] must be an object.`);
    }
    if (typeof s.name !== 'string' || s.name.trim() === '') {
      throw new BadRequestError(
        `sessions[${i}].name must be a non-empty string.`
      );
    }
    if (typeof s.time !== 'string' || !/^\d{1,2}(:\d{2}){1,2}$/.test(s.time.trim())) {
      throw new BadRequestError(
        `sessions[${i}].time must be MM:SS or HH:MM:SS.`
      );
    }
    return { name: s.name.trim(), time: s.time.trim() };
  });
};

/**
 * Validate and normalize a resource payload.
 * @param {Array} resources
 * @returns {Array<{ name: string, type: string, url: string|null }>}
 * @throws {BadRequestError}
 */
const normalizeResources = (resources) => {
  if (!Array.isArray(resources)) {
    throw new BadRequestError('resources must be an array.');
  }

  const allowedTypes = ['pdf', 'zip', 'doc', 'xls', 'ppt', 'link', 'code'];

  return resources.map((r, i) => {
    if (!r || typeof r !== 'object') {
      throw new BadRequestError(`resources[${i}] must be an object.`);
    }
    if (typeof r.name !== 'string' || r.name.trim() === '') {
      throw new BadRequestError(
        `resources[${i}].name must be a non-empty string.`
      );
    }
    const type = r.type ? String(r.type).trim().toLowerCase() : 'pdf';
    if (!allowedTypes.includes(type)) {
      throw new BadRequestError(
        `resources[${i}].type must be one of: ${allowedTypes.join(', ')}.`
      );
    }
    if (r.url !== undefined && r.url !== null && typeof r.url !== 'string') {
      throw new BadRequestError(
        `resources[${i}].url must be a string or null.`
      );
    }
    return {
      name: r.name.trim(),
      type,
      url: r.url ? String(r.url).trim() : null,
    };
  });
};

/**
 * Validate and normalize a lesson write payload.
 * @param {object} body
 * @param {object} options
 * @param {boolean} options.partial
 * @returns {object}
 */
const normalizeLessonPayload = (body, { partial }) => {
  const allowed = [
    'title',
    'titleAm',
    'duration',
    'youtubeId',
    'isFreePreview',
    'notes',
    'isPublished',
    'orderIndex',
    'sessions',
    'resources',
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

  if (!partial || body.duration !== undefined) {
    if (!body.duration || typeof body.duration !== 'string') {
      throw new BadRequestError('duration is required and must be a string.');
    }
    payload.duration = body.duration.trim();
  }

  if (!partial || body.youtubeId !== undefined) {
    payload.youtubeId = normalizeYoutubeId(body.youtubeId);
  }

  if (body.titleAm !== undefined) {
    payload.titleAm =
      body.titleAm === null ? null : String(body.titleAm).trim() || null;
  }

  if (body.notes !== undefined) {
    payload.notes =
      body.notes === null ? null : String(body.notes).trim() || null;
  }

  if (body.isFreePreview !== undefined) {
    payload.isFreePreview = Boolean(body.isFreePreview);
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

  if (body.sessions !== undefined) {
    payload.sessions = normalizeSessions(body.sessions);
  }

  if (body.resources !== undefined) {
    payload.resources = normalizeResources(body.resources);
  }

  return payload;
};

/* ============================================================================
 * QUERIES
 * ============================================================================ */

/**
 * Fetch a lesson by ID with sessions and resources.
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError}
 */
const getLessonById = async (id) => {
  const lesson = await lessonsDb.getLessonWithChildren(id);
  if (!lesson) {
    throw new NotFoundError('Lesson not found.');
  }
  return lesson;
};

/**
 * List lessons for a week.
 * @param {string} weekId
 * @param {object} [options]
 * @returns {Promise<Array>}
 * @throws {NotFoundError}
 */
const getLessonsByWeekId = async (weekId, options = {}) => {
  const week = await weeksDb.getWeekById(weekId);
  if (!week) {
    throw new NotFoundError('Week not found.');
  }
  return lessonsDb.getLessonsByWeekId(weekId, options);
};

/* ============================================================================
 * MUTATIONS
 * ============================================================================ */

/**
 * Create a lesson under a week.
 * @param {string} weekId
 * @param {object} body
 * @returns {Promise<object>}
 * @throws {NotFoundError|BadRequestError}
 */
const createLesson = async (weekId, body) => {
  const week = await weeksDb.getWeekById(weekId);
  if (!week) {
    throw new NotFoundError('Week not found.');
  }

  const payload = normalizeLessonPayload(body, { partial: false });

  let orderIndex = payload.orderIndex;
  if (orderIndex === undefined) {
    orderIndex = await lessonsDb.getNextLessonOrderIndex(weekId);
  }

  return lessonsDb.createLesson({
    ...payload,
    orderIndex,
    weekId,
  });
};

/**
 * Update a lesson. Sessions and resources present in the payload fully
 * replace the corresponding child table.
 *
 * @param {string} id
 * @param {object} body
 * @returns {Promise<object>}
 * @throws {NotFoundError|BadRequestError}
 */
const updateLesson = async (id, body) => {
  const existing = await lessonsDb.getLessonById(id);
  if (!existing) {
    throw new NotFoundError('Lesson not found.');
  }

  const payload = normalizeLessonPayload(body, { partial: true });
  const updated = await lessonsDb.updateLesson(id, payload);
  if (!updated) {
    throw new NotFoundError('Lesson not found.');
  }
  return updated;
};

/**
 * Delete a lesson. Cascades to sessions and resources at the DB level.
 * @param {string} id
 * @returns {Promise<{ deleted: boolean }>}
 */
const deleteLesson = async (id) => {
  const deleted = await lessonsDb.deleteLesson(id);
  if (!deleted) {
    throw new NotFoundError('Lesson not found.');
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
  const updated = await lessonsDb.setLessonPublishState(id, isPublished);
  if (!updated) {
    throw new NotFoundError('Lesson not found.');
  }
  return updated;
};

module.exports = {
  getLessonById,
  getLessonsByWeekId,
  createLesson,
  updateLesson,
  deleteLesson,
  setPublishState,
  normalizeYoutubeId,
};