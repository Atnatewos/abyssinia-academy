/**
 * @fileoverview Phase Database Queries
 *
 * CRUD for the `phases` table plus the `outcomes` child table. Phases are
 * the purchase unit on the platform (see payments.config perPhase), so
 * price and publish state are first-class here.
 *
 * All writes use a dynamic SET builder so a field sent as null is cleared
 * rather than silently ignored. All reads are parameterized.
 *
 * Cascade behavior (from 001_create_all_tables.sql):
 *   phases → weeks → lessons → sessions/resources
 * Deleting a phase removes everything below it at the DB level — no
 * application-level cleanup is required.
 *
 * Path: apps/api/src/database/queries/phases.js
 */

const { query } = require('../pool');

/* ============================================================================
 * READS
 * ============================================================================ */

/**
 * Fetch a phase by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getPhaseById = async (id) => {
  const { rows } = await query(
    `SELECT id, course_id, phase_number, title, title_am, subtitle, subtitle_am,
            description, description_am, color, duration, icon,
            price_etb, is_published, order_index, created_at
       FROM phases
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Fetch a phase by ID with its outcomes array attached.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getPhaseWithOutcomes = async (id) => {
  const phase = await getPhaseById(id);
  if (!phase) return null;
  phase.outcomes = await getOutcomesByPhaseId(id);
  return phase;
};

/**
 * List phases for a course.
 * @param {string} courseId
 * @param {object} [options]
 * @param {boolean} [options.includeUnpublished=false] - Include drafts
 * @returns {Promise<Array>}
 */
const getPhasesByCourseId = async (courseId, options = {}) => {
  const { includeUnpublished = false } = options;
  const filter = includeUnpublished ? '' : 'AND is_published = true';
  const { rows } = await query(
    `SELECT id, course_id, phase_number, title, title_am, subtitle, subtitle_am,
            description, description_am, color, duration, icon,
            price_etb, is_published, order_index, created_at
       FROM phases
      WHERE course_id = $1 ${filter}
      ORDER BY phase_number ASC`,
    [courseId]
  );
  return rows;
};

/**
 * Fetch outcomes for a phase, ordered.
 * @param {string} phaseId
 * @returns {Promise<string[]>} Array of outcome texts
 */
const getOutcomesByPhaseId = async (phaseId) => {
  const { rows } = await query(
    `SELECT text FROM outcomes
      WHERE phase_id = $1
      ORDER BY order_index ASC`,
    [phaseId]
  );
  return rows.map((r) => r.text);
};

/**
 * Check whether a phase_number is already taken in a course. Used to give
 * a clean 409 instead of a raw unique-constraint error.
 *
 * @param {string} courseId
 * @param {number} phaseNumber
 * @param {string} [excludePhaseId] - Skip this phase (for updates)
 * @returns {Promise<boolean>}
 */
const phaseNumberExists = async (courseId, phaseNumber, excludePhaseId = null) => {
  const params = [courseId, phaseNumber];
  let exclude = '';
  if (excludePhaseId) {
    params.push(excludePhaseId);
    exclude = `AND id <> $${params.length}`;
  }
  const { rowCount } = await query(
    `SELECT 1 FROM phases
      WHERE course_id = $1 AND phase_number = $2 ${exclude}
      LIMIT 1`,
    params
  );
  return rowCount > 0;
};

/**
 * Get the next free phase_number for a course. Used by the "Add Phase"
 * flow so the admin doesn't have to remember the last number.
 *
 * @param {string} courseId
 * @returns {Promise<number>}
 */
const getNextPhaseNumber = async (courseId) => {
  const { rows } = await query(
    `SELECT COALESCE(MAX(phase_number), 0) + 1 AS next
       FROM phases
      WHERE course_id = $1`,
    [courseId]
  );
  return rows[0].next;
};

/* ============================================================================
 * WRITES
 * ============================================================================ */

/**
 * Create a phase. Outcomes are inserted in the same transaction so a
 * partially-created phase never leaves orphan rows behind.
 *
 * @param {object} data
 * @param {string} data.courseId
 * @param {number} data.phaseNumber
 * @param {string} data.title
 * @param {string} data.subtitle
 * @param {string} data.description
 * @param {string} data.duration
 * @param {string[]} [data.outcomes]
 * @param {string|null} [data.titleAm]
 * @param {string|null} [data.subtitleAm]
 * @param {string|null} [data.descriptionAm]
 * @param {string|null} [data.color]
 * @param {string|null} [data.icon]
 * @param {number|null} [data.priceEtb]
 * @param {boolean} [data.isPublished=true]
 * @param {number} [data.orderIndex=0]
 * @returns {Promise<object>} Created phase with outcomes attached
 */
const createPhase = async (data) => {
  const phaseResult = await query(
    `INSERT INTO phases (
       course_id, phase_number, title, title_am, subtitle, subtitle_am,
       description, description_am, color, duration, icon,
       price_etb, is_published, order_index
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      data.courseId,
      data.phaseNumber,
      data.title,
      data.titleAm ?? null,
      data.subtitle,
      data.subtitleAm ?? null,
      data.description,
      data.descriptionAm ?? null,
      data.color ?? null,
      data.duration,
      data.icon ?? null,
      data.priceEtb ?? null,
      data.isPublished !== undefined ? data.isPublished : true,
      data.orderIndex ?? 0,
    ]
  );

  const phase = phaseResult.rows[0];

  if (Array.isArray(data.outcomes) && data.outcomes.length > 0) {
    await replaceOutcomes(phase.id, data.outcomes);
    phase.outcomes = data.outcomes;
  } else {
    phase.outcomes = [];
  }

  return phase;
};

/**
 * Update a phase using a dynamic SET builder. Fields omitted from the
 * payload are left untouched; fields sent as null are cleared.
 *
 * When `outcomes` is provided (even an empty array), the outcomes table
 * is fully replaced to match the payload.
 *
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
const updatePhase = async (id, data) => {
  const columnMap = {
    phaseNumber: 'phase_number',
    title: 'title',
    titleAm: 'title_am',
    subtitle: 'subtitle',
    subtitleAm: 'subtitle_am',
    description: 'description',
    descriptionAm: 'description_am',
    color: 'color',
    duration: 'duration',
    icon: 'icon',
    priceEtb: 'price_etb',
    isPublished: 'is_published',
    orderIndex: 'order_index',
  };

  const fields = [];
  const values = [];

  for (const [key, column] of Object.entries(columnMap)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      values.push(data[key]);
      fields.push(`${column} = $${values.length}`);
    }
  }

  let updated = null;
  if (fields.length > 0) {
    values.push(id);
    const { rows } = await query(
      `UPDATE phases SET ${fields.join(', ')}
        WHERE id = $${values.length}
        RETURNING *`,
      values
    );
    updated = rows[0] || null;
  } else {
    updated = await getPhaseById(id);
  }

  if (!updated) return null;

  if (Array.isArray(data.outcomes)) {
    await replaceOutcomes(id, data.outcomes);
    updated.outcomes = data.outcomes;
  } else {
    updated.outcomes = await getOutcomesByPhaseId(id);
  }

  return updated;
};

/**
 * Delete a phase. Cascades to weeks/lessons/sessions/resources.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
const deletePhase = async (id) => {
  const { rowCount } = await query('DELETE FROM phases WHERE id = $1', [id]);
  return rowCount > 0;
};

/**
 * Flip a phase's publish flag and return the updated row.
 * @param {string} id
 * @param {boolean} isPublished
 * @returns {Promise<object|null>}
 */
const setPhasePublishState = async (id, isPublished) => {
  const { rows } = await query(
    `UPDATE phases SET is_published = $1
      WHERE id = $2
      RETURNING *`,
    [isPublished, id]
  );
  return rows[0] || null;
};

/* ============================================================================
 * INTERNAL — OUTCOME REPLACEMENT
 * ============================================================================ */

/**
 * Replace all outcomes for a phase. Deletes the existing set, then inserts
 * the new texts in order. Runs in one transaction so a failure leaves the
 * previous outcomes intact.
 *
 * @param {string} phaseId
 * @param {string[]} outcomes
 * @returns {Promise<void>}
 */
const replaceOutcomes = async (phaseId, outcomes) => {
  const { getClient } = require('../pool');
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM outcomes WHERE phase_id = $1', [phaseId]);
    for (let i = 0; i < outcomes.length; i += 1) {
      await client.query(
        `INSERT INTO outcomes (phase_id, text, order_index)
         VALUES ($1, $2, $3)`,
        [phaseId, outcomes[i], i]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getPhaseById,
  getPhaseWithOutcomes,
  getPhasesByCourseId,
  getOutcomesByPhaseId,
  phaseNumberExists,
  getNextPhaseNumber,
  createPhase,
  updatePhase,
  deletePhase,
  setPhasePublishState,
};