/**
 * @fileoverview Course Database Queries
 * All course, phase, week, lesson related queries
 * Path: apps/api/src/database/queries/courses.js
 */

const { query } = require('../pool');

/**
 * Get all published courses
 * @returns {Array} Courses list
 */
const getAllCourses = async () => {
  const result = await query(
    `SELECT id, slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url
     FROM courses
     WHERE is_published = true
     ORDER BY order_index ASC, created_at DESC`
  );
  return result.rows;
};

/**
 * Get course by slug with all phases, weeks, lessons, sessions, resources
 * @param {string} slug - Course slug
 * @returns {object|null} Course with full nested curriculum
 */
const getCourseBySlug = async (slug) => {
  const courseResult = await query(
    `SELECT id, slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url
     FROM courses
     WHERE slug = $1 AND is_published = true`,
    [slug]
  );

  if (courseResult.rows.length === 0) return null;

  const course = courseResult.rows[0];

  const phasesResult = await query(
    `SELECT id, phase_number, title, title_am, subtitle, subtitle_am, description, description_am, color, duration, icon
     FROM phases
     WHERE course_id = $1
     ORDER BY phase_number ASC`,
    [course.id]
  );

  course.phases = phasesResult.rows;

  for (const phase of course.phases) {
    const outcomesResult = await query(
      `SELECT text FROM outcomes WHERE phase_id = $1 ORDER BY order_index ASC`,
      [phase.id]
    );
    phase.outcomes = outcomesResult.rows.map((o) => o.text);

    const weeksResult = await query(
      `SELECT id, week_number, title, title_am FROM weeks WHERE phase_id = $1 ORDER BY week_number ASC`,
      [phase.id]
    );
    phase.weeks = weeksResult.rows;

    for (const week of phase.weeks) {
      const lessonsResult = await query(
        `SELECT id, title, title_am, duration, youtube_id, is_free_preview, notes, order_index
         FROM lessons WHERE week_id = $1 ORDER BY order_index ASC`,
        [week.id]
      );
      week.lessons = lessonsResult.rows;

      for (const lesson of week.lessons) {
        const sessionsResult = await query(
          `SELECT name, time FROM sessions WHERE lesson_id = $1 ORDER BY order_index ASC`,
          [lesson.id]
        );
        lesson.sessions = sessionsResult.rows;

        const resourcesResult = await query(
          `SELECT name, type, url FROM resources WHERE lesson_id = $1 ORDER BY order_index ASC`,
          [lesson.id]
        );
        lesson.resources = resourcesResult.rows.map((r) => r.name);
      }
    }
  }

  return course;
};

/**
 * Get course by ID (admin)
 * @param {string} id - Course UUID
 * @returns {object|null} Course object
 */
const getCourseById = async (id) => {
  const result = await query('SELECT * FROM courses WHERE id = $1', [id]);
  return result.rows[0] || null;
};

/**
 * Get phases for a course
 * @param {string} courseId - Course UUID
 * @returns {Array} Phases list with outcomes
 */
const getPhasesByCourseId = async (courseId) => {
  const result = await query(
    `SELECT * FROM phases WHERE course_id = $1 ORDER BY phase_number ASC`,
    [courseId]
  );

  for (const phase of result.rows) {
    const outcomesResult = await query(
      `SELECT text FROM outcomes WHERE phase_id = $1 ORDER BY order_index ASC`,
      [phase.id]
    );
    phase.outcomes = outcomesResult.rows.map((o) => o.text);
  }

  return result.rows;
};

/**
 * Get weeks for a phase
 * @param {string} phaseId - Phase UUID
 * @returns {Array} Weeks list
 */
const getWeeksByPhaseId = async (phaseId) => {
  const result = await query(
    'SELECT * FROM weeks WHERE phase_id = $1 ORDER BY week_number ASC',
    [phaseId]
  );
  return result.rows;
};

/**
 * Get lessons for a week with sessions and resources
 * @param {string} weekId - Week UUID
 * @returns {Array} Lessons list
 */
const getLessonsByWeekId = async (weekId) => {
  const result = await query(
    `SELECT * FROM lessons WHERE week_id = $1 ORDER BY order_index ASC`,
    [weekId]
  );

  for (const lesson of result.rows) {
    const sessionsResult = await query(
      `SELECT name, time FROM sessions WHERE lesson_id = $1 ORDER BY order_index ASC`,
      [lesson.id]
    );
    lesson.sessions = sessionsResult.rows;

    const resourcesResult = await query(
      `SELECT name, type, url FROM resources WHERE lesson_id = $1 ORDER BY order_index ASC`,
      [lesson.id]
    );
    lesson.resources = resourcesResult.rows.map((r) => r.name);
  }

  return result.rows;
};

/**
 * Get full course curriculum (all phases, weeks, lessons)
 * @param {string} courseId - Course UUID
 * @returns {Array} Complete course structure
 */
const getFullCurriculum = async (courseId) => {
  const phases = await getPhasesByCourseId(courseId);

  for (const phase of phases) {
    const weeks = await getWeeksByPhaseId(phase.id);
    for (const week of weeks) {
      week.lessons = await getLessonsByWeekId(week.id);
    }
    phase.weeks = weeks;
  }

  return phases;
};

/**
 * Get lesson by ID with full details
 * @param {string} lessonId - Lesson UUID
 * @returns {object|null} Lesson with sessions and resources
 */
const getLessonById = async (lessonId) => {
  const result = await query(
    `SELECT * FROM lessons WHERE id = $1`,
    [lessonId]
  );

  if (result.rows.length === 0) return null;

  const lesson = result.rows[0];

  const sessionsResult = await query(
    `SELECT name, time FROM sessions WHERE lesson_id = $1 ORDER BY order_index ASC`,
    [lesson.id]
  );
  lesson.sessions = sessionsResult.rows;

  const resourcesResult = await query(
    `SELECT name, type, url FROM resources WHERE lesson_id = $1 ORDER BY order_index ASC`,
    [lesson.id]
  );
  lesson.resources = resourcesResult.rows.map((r) => r.name);

  return lesson;
};

/**
 * Create a new course (admin)
 * @param {object} courseData - Course data
 * @returns {object} Created course
 */
const createCourse = async (courseData) => {
  const { slug, title, titleAm, description, descriptionAm, level, duration, badge, icon, thumbnailUrl } = courseData;

  const result = await query(
    `INSERT INTO courses (slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [slug, title, titleAm, description, descriptionAm, level, duration, badge, icon, thumbnailUrl]
  );
  return result.rows[0];
};

/**
 * Update a course (admin)
 * @param {string} id - Course UUID
 * @param {object} courseData - Updated course data
 * @returns {object} Updated course
 */
const updateCourse = async (id, courseData) => {
  const { title, titleAm, description, descriptionAm, level, duration, badge, icon, isPublished, thumbnailUrl } = courseData;

  const result = await query(
    `UPDATE courses 
     SET title = COALESCE($2, title), title_am = COALESCE($3, title_am), 
         description = COALESCE($4, description), description_am = COALESCE($5, description_am),
         level = COALESCE($6, level), duration = COALESCE($7, duration),
         badge = COALESCE($8, badge), icon = COALESCE($9, icon),
         is_published = COALESCE($10, is_published), thumbnail_url = COALESCE($11, thumbnail_url),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title, titleAm, description, descriptionAm, level, duration, badge, icon, isPublished, thumbnailUrl]
  );
  return result.rows[0];
};

module.exports = {
  getAllCourses,
  getCourseBySlug,
  getCourseById,
  getPhasesByCourseId,
  getWeeksByPhaseId,
  getLessonsByWeekId,
  getFullCurriculum,
  getLessonById,
  createCourse,
  updateCourse,
};