/**
 * @fileoverview Lesson Database Queries
 *
 * CRUD for the `lessons` table plus its `sessions` and `resources` child
 * tables. A lesson is the smallest unit of content — a single video with
 * optional timestamped sessions and downloadable attachments.
 *
 * Sessions and resources are managed as full replacements on update —
 * sending a new array rewrites the set atomically so the admin UI never
 * has to track individual child IDs.
 *
 * Path: apps/api/src/database/queries/lessons.js
 */

const { query, getClient } = require('../pool');

/* ============================================================================
 * READS
 * ============================================================================ */

/**
 * Fetch a lesson by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getLessonById = async (id) => {
  const { rows } = await query(
    `SELECT id, week_id, title, title_am, duration, youtube_id,
            is_free_preview, notes, is_published, order_index, created_at
       FROM lessons
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Fetch a lesson with its sessions and resources attached.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getLessonWithChildren = async (id) => {
  const lesson = await getLessonById(id);
  if (!lesson) return null;

  const [sessionsResult, resourcesResult] = await Promise.all([
    query(
      `SELECT name, time FROM sessions
        WHERE lesson_id = $1 ORDER BY order_index ASC`,
      [id]
    ),
    query(
      `SELECT name, type, url FROM resources
        WHERE lesson_id = $1 ORDER BY order_index ASC`,
      [id]
    ),
  ]);

  lesson.sessions = sessionsResult.rows;
  lesson.resources = resourcesResult.rows;
  return lesson;
};

/**
 * List lessons for a week.
 * @param {string} weekId
 * @param {object} [options]
 * @param {boolean} [options.includeUnpublished=false]
 * @returns {Promise<Array>}
 */
const getLessonsByWeekId = async (weekId, options = {}) => {
  const { includeUnpublished = false } = options;
  const filter = includeUnpublished ? '' : 'AND is_published = true';
  const { rows } = await query(
    `SELECT id, week_id, title, title_am, duration, youtube_id,
            is_free_preview, notes, is_published, order_index, created_at
       FROM lessons
      WHERE week_id = $1 ${filter}
      ORDER BY order_index ASC`,
    [weekId]
  );
  return rows;
};

/**
 * Get the next free order_index for a week.
 * @param {string} weekId
 * @returns {Promise<number>}
 */
const getNextLessonOrderIndex = async (weekId) => {
  const { rows } = await query(
    `SELECT COALESCE(MAX(order_index), 0) + 1 AS next
       FROM lessons
      WHERE week_id = $1`,
    [weekId]
  );
  return rows[0].next;
};

/* ============================================================================
 * WRITES
 * ============================================================================ */

/**
 * Create a lesson plus its sessions and resources in one transaction.
 * A partially-created lesson never leaves orphan sessions or resources.
 *
 * @param {object} data
 * @param {string} data.weekId
 * @param {string} data.title
 * @param {string} data.duration
 * @param {string} data.youtubeId
 * @param {string|null} [data.titleAm]
 * @param {boolean} [data.isFreePreview=false]
 * @param {string|null} [data.notes]
 * @param {boolean} [data.isPublished=true]
 * @param {number} [data.orderIndex]
 * @param {Array<{name: string, time: string}>} [data.sessions]
 * @param {Array<{name: string, type?: string, url?: string|null}>} [data.resources]
 * @returns {Promise<object>} Created lesson with children attached
 */
const createLesson = async (data) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO lessons (
         week_id, title, title_am, duration, youtube_id,
         is_free_preview, notes, is_published, order_index
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.weekId,
        data.title,
        data.titleAm ?? null,
        data.duration,
        data.youtubeId,
        data.isFreePreview === true,
        data.notes ?? null,
        data.isPublished !== undefined ? data.isPublished : true,
        data.orderIndex ?? 0,
      ]
    );
    const lesson = rows[0];

    if (Array.isArray(data.sessions) && data.sessions.length > 0) {
      for (let i = 0; i < data.sessions.length; i += 1) {
        const s = data.sessions[i];
        await client.query(
          `INSERT INTO sessions (lesson_id, name, time, order_index)
           VALUES ($1, $2, $3, $4)`,
          [lesson.id, s.name, s.time, i]
        );
      }
    }

    if (Array.isArray(data.resources) && data.resources.length > 0) {
      for (let i = 0; i < data.resources.length; i += 1) {
        const r = data.resources[i];
        await client.query(
          `INSERT INTO resources (lesson_id, name, type, url, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [lesson.id, r.name, r.type || 'pdf', r.url ?? null, i]
        );
      }
    }

    await client.query('COMMIT');

    lesson.sessions = data.sessions || [];
    lesson.resources = data.resources || [];
    return lesson;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update a lesson. Any of `sessions` or `resources` present in the payload
 * fully replaces the corresponding child table — the admin UI just sends
 * the desired end state, never has to track individual child IDs.
 *
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
const updateLesson = async (id, data) => {
  const columnMap = {
    title: 'title',
    titleAm: 'title_am',
    duration: 'duration',
    youtubeId: 'youtube_id',
    isFreePreview: 'is_free_preview',
    notes: 'notes',
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

  const client = await getClient();
  try {
    await client.query('BEGIN');

    if (fields.length > 0) {
      values.push(id);
      const { rows } = await client.query(
        `UPDATE lessons SET ${fields.join(', ')}
          WHERE id = $${values.length}
          RETURNING *`,
        values
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
    } else {
      const check = await client.query(
        'SELECT 1 FROM lessons WHERE id = $1',
        [id]
      );
      if (check.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }
    }

    if (Array.isArray(data.sessions)) {
      await client.query('DELETE FROM sessions WHERE lesson_id = $1', [id]);
      for (let i = 0; i < data.sessions.length; i += 1) {
        const s = data.sessions[i];
        await client.query(
          `INSERT INTO sessions (lesson_id, name, time, order_index)
           VALUES ($1, $2, $3, $4)`,
          [id, s.name, s.time, i]
        );
      }
    }

    if (Array.isArray(data.resources)) {
      await client.query('DELETE FROM resources WHERE lesson_id = $1', [id]);
      for (let i = 0; i < data.resources.length; i += 1) {
        const r = data.resources[i];
        await client.query(
          `INSERT INTO resources (lesson_id, name, type, url, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, r.name, r.type || 'pdf', r.url ?? null, i]
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return getLessonWithChildren(id);
};

/**
 * Delete a lesson. Cascades to sessions and resources.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
const deleteLesson = async (id) => {
  const { rowCount } = await query('DELETE FROM lessons WHERE id = $1', [id]);
  return rowCount > 0;
};

/**
 * Flip a lesson's publish flag.
 * @param {string} id
 * @param {boolean} isPublished
 * @returns {Promise<object|null>}
 */
const setLessonPublishState = async (id, isPublished) => {
  const { rows } = await query(
    `UPDATE lessons SET is_published = $1
      WHERE id = $2
      RETURNING *`,
    [isPublished, id]
  );
  return rows[0] || null;
};

module.exports = {
  getLessonById,
  getLessonWithChildren,
  getLessonsByWeekId,
  getNextLessonOrderIndex,
  createLesson,
  updateLesson,
  deleteLesson,
  setLessonPublishState,
};