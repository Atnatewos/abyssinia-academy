/**
 * @fileoverview Week Database Queries
 *
 * CRUD for the `weeks` table. Weeks are the scheduling layer between
 * phases and lessons — they carry a sequence number, a title, and a
 * publish flag.
 *
 * Cascade behavior: weeks → lessons → sessions/resources. Deleting a
 * week removes everything below at the DB level.
 *
 * Path: apps/api/src/database/queries/weeks.js
 */

const { query } = require('../pool');

/* ============================================================================
 * READS
 * ============================================================================ */

/**
 * Fetch a week by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getWeekById = async (id) => {
  const { rows } = await query(
    `SELECT id, phase_id, week_number, title, title_am,
            is_published, order_index
       FROM weeks
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * List weeks for a phase.
 * @param {string} phaseId
 * @param {object} [options]
 * @param {boolean} [options.includeUnpublished=false]
 * @returns {Promise<Array>}
 */
const getWeeksByPhaseId = async (phaseId, options = {}) => {
  const { includeUnpublished = false } = options;
  const filter = includeUnpublished ? '' : 'AND is_published = true';
  const { rows } = await query(
    `SELECT id, phase_id, week_number, title, title_am,
            is_published, order_index
       FROM weeks
      WHERE phase_id = $1 ${filter}
      ORDER BY week_number ASC`,
    [phaseId]
  );
  return rows;
};

/**
 * Check whether a week_number is already taken in a phase.
 * @param {string} phaseId
 * @param {number} weekNumber
 * @param {string} [excludeWeekId]
 * @returns {Promise<boolean>}
 */
const weekNumberExists = async (phaseId, weekNumber, excludeWeekId = null) => {
  const params = [phaseId, weekNumber];
  let exclude = '';
  if (excludeWeekId) {
    params.push(excludeWeekId);
    exclude = `AND id <> $${params.length}`;
  }
  const { rowCount } = await query(
    `SELECT 1 FROM weeks
      WHERE phase_id = $1 AND week_number = $2 ${exclude}
      LIMIT 1`,
    params
  );
  return rowCount > 0;
};

/**
 * Get the next free week_number for a phase.
 * @param {string} phaseId
 * @returns {Promise<number>}
 */
const getNextWeekNumber = async (phaseId) => {
  const { rows } = await query(
    `SELECT COALESCE(MAX(week_number), 0) + 1 AS next
       FROM weeks
      WHERE phase_id = $1`,
    [phaseId]
  );
  return rows[0].next;
};

/* ============================================================================
 * WRITES
 * ============================================================================ */

/**
 * Create a week.
 * @param {object} data
 * @param {string} data.phaseId
 * @param {number} data.weekNumber
 * @param {string} data.title
 * @param {string|null} [data.titleAm]
 * @param {boolean} [data.isPublished=true]
 * @param {number} [data.orderIndex=0]
 * @returns {Promise<object>}
 */
const createWeek = async (data) => {
  const { rows } = await query(
    `INSERT INTO weeks (
       phase_id, week_number, title, title_am, is_published, order_index
     ) VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      data.phaseId,
      data.weekNumber,
      data.title,
      data.titleAm ?? null,
      data.isPublished !== undefined ? data.isPublished : true,
      data.orderIndex ?? 0,
    ]
  );
  return rows[0];
};

/**
 * Update a week using a dynamic SET builder.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
const updateWeek = async (id, data) => {
  const columnMap = {
    weekNumber: 'week_number',
    title: 'title',
    titleAm: 'title_am',
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

  if (fields.length === 0) {
    return getWeekById(id);
  }

  values.push(id);
  const { rows } = await query(
    `UPDATE weeks SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *`,
    values
  );
  return rows[0] || null;
};

/**
 * Delete a week. Cascades to lessons/sessions/resources.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
const deleteWeek = async (id) => {
  const { rowCount } = await query('DELETE FROM weeks WHERE id = $1', [id]);
  return rowCount > 0;
};

/**
 * Flip a week's publish flag.
 * @param {string} id
 * @param {boolean} isPublished
 * @returns {Promise<object|null>}
 */
const setWeekPublishState = async (id, isPublished) => {
  const { rows } = await query(
    `UPDATE weeks SET is_published = $1
      WHERE id = $2
      RETURNING *`,
    [isPublished, id]
  );
  return rows[0] || null;
};

module.exports = {
  getWeekById,
  getWeeksByPhaseId,
  weekNumberExists,
  getNextWeekNumber,
  createWeek,
  updateWeek,
  deleteWeek,
  setWeekPublishState,
};