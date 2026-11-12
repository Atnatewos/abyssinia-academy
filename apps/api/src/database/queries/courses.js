// /**
//  * @fileoverview Course Database Queries
//  * All course, phase, week, lesson related queries
//  * Path: apps/api/src/database/queries/courses.js
//  */

// const { query } = require('../pool');

// /**
//  * Get all published courses
//  * @returns {Array} Courses list
//  */
// const getAllCourses = async () => {
//   const result = await query(
//     `SELECT id, slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url
//      FROM courses
//      WHERE is_published = true
//      ORDER BY order_index ASC, created_at DESC`
//   );
//   return result.rows;
// };

// /**
//  * Get course by slug with all phases, weeks, lessons, sessions, resources
//  * @param {string} slug - Course slug
//  * @returns {object|null} Course with full nested curriculum
//  */
// const getCourseBySlug = async (slug) => {
//   const courseResult = await query(
//     `SELECT id, slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url
//      FROM courses
//      WHERE slug = $1 AND is_published = true`,
//     [slug]
//   );

//   if (courseResult.rows.length === 0) return null;

//   const course = courseResult.rows[0];

//   const phasesResult = await query(
//     `SELECT id, phase_number, title, title_am, subtitle, subtitle_am, description, description_am, color, duration, icon
//      FROM phases
//      WHERE course_id = $1
//      ORDER BY phase_number ASC`,
//     [course.id]
//   );

//   course.phases = phasesResult.rows;

//   for (const phase of course.phases) {
//     const outcomesResult = await query(
//       `SELECT text FROM outcomes WHERE phase_id = $1 ORDER BY order_index ASC`,
//       [phase.id]
//     );
//     phase.outcomes = outcomesResult.rows.map((o) => o.text);

//     const weeksResult = await query(
//       `SELECT id, week_number, title, title_am FROM weeks WHERE phase_id = $1 ORDER BY week_number ASC`,
//       [phase.id]
//     );
//     phase.weeks = weeksResult.rows;

//     for (const week of phase.weeks) {
//       const lessonsResult = await query(
//         `SELECT id, title, title_am, duration, youtube_id, is_free_preview, notes, order_index
//          FROM lessons WHERE week_id = $1 ORDER BY order_index ASC`,
//         [week.id]
//       );
//       week.lessons = lessonsResult.rows;

//       for (const lesson of week.lessons) {
//         const sessionsResult = await query(
//           `SELECT name, time FROM sessions WHERE lesson_id = $1 ORDER BY order_index ASC`,
//           [lesson.id]
//         );
//         lesson.sessions = sessionsResult.rows;

//         const resourcesResult = await query(
//           `SELECT name, type, url FROM resources WHERE lesson_id = $1 ORDER BY order_index ASC`,
//           [lesson.id]
//         );
//         lesson.resources = resourcesResult.rows.map((r) => r.name);
//       }
//     }
//   }

//   return course;
// };

// /**
//  * Get course by ID (admin)
//  * @param {string} id - Course UUID
//  * @returns {object|null} Course object
//  */
// const getCourseById = async (id) => {
//   const result = await query('SELECT * FROM courses WHERE id = $1', [id]);
//   return result.rows[0] || null;
// };

// /**
//  * Get phases for a course
//  * @param {string} courseId - Course UUID
//  * @returns {Array} Phases list with outcomes
//  */
// const getPhasesByCourseId = async (courseId) => {
//   const result = await query(
//     `SELECT * FROM phases WHERE course_id = $1 ORDER BY phase_number ASC`,
//     [courseId]
//   );

//   for (const phase of result.rows) {
//     const outcomesResult = await query(
//       `SELECT text FROM outcomes WHERE phase_id = $1 ORDER BY order_index ASC`,
//       [phase.id]
//     );
//     phase.outcomes = outcomesResult.rows.map((o) => o.text);
//   }

//   return result.rows;
// };

// /**
//  * Get weeks for a phase
//  * @param {string} phaseId - Phase UUID
//  * @returns {Array} Weeks list
//  */
// const getWeeksByPhaseId = async (phaseId) => {
//   const result = await query(
//     'SELECT * FROM weeks WHERE phase_id = $1 ORDER BY week_number ASC',
//     [phaseId]
//   );
//   return result.rows;
// };

// /**
//  * Get lessons for a week with sessions and resources
//  * @param {string} weekId - Week UUID
//  * @returns {Array} Lessons list
//  */
// const getLessonsByWeekId = async (weekId) => {
//   const result = await query(
//     `SELECT * FROM lessons WHERE week_id = $1 ORDER BY order_index ASC`,
//     [weekId]
//   );

//   for (const lesson of result.rows) {
//     const sessionsResult = await query(
//       `SELECT name, time FROM sessions WHERE lesson_id = $1 ORDER BY order_index ASC`,
//       [lesson.id]
//     );
//     lesson.sessions = sessionsResult.rows;

//     const resourcesResult = await query(
//       `SELECT name, type, url FROM resources WHERE lesson_id = $1 ORDER BY order_index ASC`,
//       [lesson.id]
//     );
//     lesson.resources = resourcesResult.rows.map((r) => r.name);
//   }

//   return result.rows;
// };

// /**
//  * Get full course curriculum (all phases, weeks, lessons)
//  * @param {string} courseId - Course UUID
//  * @returns {Array} Complete course structure
//  */
// const getFullCurriculum = async (courseId) => {
//   const phases = await getPhasesByCourseId(courseId);

//   for (const phase of phases) {
//     const weeks = await getWeeksByPhaseId(phase.id);
//     for (const week of weeks) {
//       week.lessons = await getLessonsByWeekId(week.id);
//     }
//     phase.weeks = weeks;
//   }

//   return phases;
// };

// /**
//  * Get lesson by ID with full details
//  * @param {string} lessonId - Lesson UUID
//  * @returns {object|null} Lesson with sessions and resources
//  */
// const getLessonById = async (lessonId) => {
//   const result = await query(
//     `SELECT * FROM lessons WHERE id = $1`,
//     [lessonId]
//   );

//   if (result.rows.length === 0) return null;

//   const lesson = result.rows[0];

//   const sessionsResult = await query(
//     `SELECT name, time FROM sessions WHERE lesson_id = $1 ORDER BY order_index ASC`,
//     [lesson.id]
//   );
//   lesson.sessions = sessionsResult.rows;

//   const resourcesResult = await query(
//     `SELECT name, type, url FROM resources WHERE lesson_id = $1 ORDER BY order_index ASC`,
//     [lesson.id]
//   );
//   lesson.resources = resourcesResult.rows.map((r) => r.name);

//   return lesson;
// };

// /**
//  * Create a new course (admin)
//  * @param {object} courseData - Course data
//  * @returns {object} Created course
//  */
// const createCourse = async (courseData) => {
//   const { slug, title, titleAm, description, descriptionAm, level, duration, badge, icon, thumbnailUrl } = courseData;

//   const result = await query(
//     `INSERT INTO courses (slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url)
//      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//      RETURNING *`,
//     [slug, title, titleAm, description, descriptionAm, level, duration, badge, icon, thumbnailUrl]
//   );
//   return result.rows[0];
// };

// /**
//  * Update a course (admin)
//  * @param {string} id - Course UUID
//  * @param {object} courseData - Updated course data
//  * @returns {object} Updated course
//  */
// const updateCourse = async (id, courseData) => {
//   const { title, titleAm, description, descriptionAm, level, duration, badge, icon, isPublished, thumbnailUrl } = courseData;

//   const result = await query(
//     `UPDATE courses 
//      SET title = COALESCE($2, title), title_am = COALESCE($3, title_am), 
//          description = COALESCE($4, description), description_am = COALESCE($5, description_am),
//          level = COALESCE($6, level), duration = COALESCE($7, duration),
//          badge = COALESCE($8, badge), icon = COALESCE($9, icon),
//          is_published = COALESCE($10, is_published), thumbnail_url = COALESCE($11, thumbnail_url),
//          updated_at = NOW()
//      WHERE id = $1
//      RETURNING *`,
//     [id, title, titleAm, description, descriptionAm, level, duration, badge, icon, isPublished, thumbnailUrl]
//   );
//   return result.rows[0];
// };

// module.exports = {
//   getAllCourses,
//   getCourseBySlug,
//   getCourseById,
//   getPhasesByCourseId,
//   getWeeksByPhaseId,
//   getLessonsByWeekId,
//   getFullCurriculum,
//   getLessonById,
//   createCourse,
//   updateCourse,
// };

/**
 * @fileoverview Course Database Queries
 *
 * Every query is parameterized. The update function uses a dynamic SET
 * builder so a field sent as `null` is cleared rather than silently
 * ignored — the pre-Wave-0 COALESCE approach made it impossible for the
 * admin to blank out a field.
 *
 * Nested curriculum (phases → weeks → lessons → sessions/resources) is
 * fetched with batched WHERE ... = ANY($1) queries instead of per-item
 * loops, reducing a full-course fetch from ~232 round-trips to 6.
 *
 * Path: apps/api/src/database/queries/courses.js
 */

const { query } = require('../pool');

/* ============================================================================
 * PUBLIC READS
 * ============================================================================ */

/**
 * List all published courses for the public catalog.
 * @returns {Promise<Array>}
 */
const getAllCourses = async () => {
  const { rows } = await query(
    `SELECT id, slug, title, title_am, description, description_am,
            level, duration, badge, icon, thumbnail_url,
            price_etb, is_published, order_index
       FROM courses
      WHERE is_published = true
      ORDER BY order_index ASC NULLS LAST, created_at DESC`
  );
  return rows;
};

/**
 * Fetch a course by slug with its full curriculum.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
const getCourseBySlug = async (slug) => {
  const courseResult = await query(
    `SELECT id, slug, title, title_am, description, description_am,
            level, duration, badge, icon, thumbnail_url,
            price_etb, is_published, order_index
       FROM courses
      WHERE slug = $1 AND is_published = true`,
    [slug]
  );
  if (courseResult.rows.length === 0) return null;

  const course = courseResult.rows[0];
  course.phases = await attachCurriculum(course.id);
  return course;
};

/* ============================================================================
 * ADMIN READS
 * ============================================================================ */

/**
 * List all courses (published and drafts) for the admin panel.
 * Supports free-text search and level filter.
 *
 * @param {object} [options]
 * @param {string} [options.search]
 * @param {string} [options.level]
 * @returns {Promise<Array>}
 */
const getAllCoursesForAdmin = async (options = {}) => {
  const { search = '', level = '' } = options;
  const params = [];
  const where = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(title ILIKE $${params.length} OR slug ILIKE $${params.length} OR description ILIKE $${params.length})`
    );
  }

  if (level) {
    params.push(level);
    where.push(`level = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await query(
    `SELECT id, slug, title, title_am, description, description_am,
            level, duration, badge, icon, thumbnail_url,
            price_etb, is_published, order_index,
            created_at, updated_at
       FROM courses
       ${whereClause}
       ORDER BY order_index ASC NULLS LAST, created_at DESC`,
    params
  );
  return rows;
};

/**
 * Fetch a course by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getCourseById = async (id) => {
  const { rows } = await query('SELECT * FROM courses WHERE id = $1', [id]);
  return rows[0] || null;
};

/**
 * Fetch a course by ID with its full curriculum (admin — includes drafts).
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getCourseByIdWithCurriculum = async (id) => {
  const course = await getCourseById(id);
  if (!course) return null;
  course.phases = await attachCurriculum(id, { includeUnpublished: true });
  return course;
};

/**
 * Fetch phases for a course, with outcomes.
 * @param {string} courseId
 * @param {object} [options]
 * @param {boolean} [options.includeUnpublished=false]
 * @returns {Promise<Array>}
 */
const getPhasesByCourseId = async (courseId, options = {}) => {
  const { includeUnpublished = false } = options;
  const filter = includeUnpublished ? '' : 'AND is_published = true';

  const phasesResult = await query(
    `SELECT id, course_id, phase_number, title, title_am, subtitle, subtitle_am,
            description, description_am, color, duration, icon,
            price_etb, is_published, order_index
       FROM phases
      WHERE course_id = $1 ${filter}
      ORDER BY phase_number ASC`,
    [courseId]
  );

  if (phasesResult.rows.length === 0) return [];

  const phaseIds = phasesResult.rows.map((p) => p.id);
  const outcomesResult = await query(
    `SELECT phase_id, text
       FROM outcomes
      WHERE phase_id = ANY($1::uuid[])
      ORDER BY order_index ASC`,
    [phaseIds]
  );
  const outcomesByPhase = outcomesResult.rows.reduce((acc, row) => {
    (acc[row.phase_id] = acc[row.phase_id] || []).push(row.text);
    return acc;
  }, {});

  return phasesResult.rows.map((phase) => ({
    ...phase,
    outcomes: outcomesByPhase[phase.id] || [],
  }));
};

/**
 * Fetch weeks for a phase.
 * @param {string} phaseId
 * @param {object} [options]
 * @returns {Promise<Array>}
 */
const getWeeksByPhaseId = async (phaseId, options = {}) => {
  const { includeUnpublished = false } = options;
  const filter = includeUnpublished ? '' : 'AND is_published = true';
  const { rows } = await query(
    `SELECT id, phase_id, week_number, title, title_am, is_published, order_index
       FROM weeks
      WHERE phase_id = $1 ${filter}
      ORDER BY week_number ASC`,
    [phaseId]
  );
  return rows;
};

/**
 * Fetch lessons for a week with sessions and resources attached.
 * @param {string} weekId
 * @param {object} [options]
 * @returns {Promise<Array>}
 */
const getLessonsByWeekId = async (weekId, options = {}) => {
  const { includeUnpublished = false } = options;
  const filter = includeUnpublished ? '' : 'AND is_published = true';

  const lessonsResult = await query(
    `SELECT id, week_id, title, title_am, duration, youtube_id,
            is_free_preview, notes, is_published, order_index
       FROM lessons
      WHERE week_id = $1 ${filter}
      ORDER BY order_index ASC`,
    [weekId]
  );
  if (lessonsResult.rows.length === 0) return [];

  const lessonIds = lessonsResult.rows.map((l) => l.id);

  const [sessionsResult, resourcesResult] = await Promise.all([
    query(
      `SELECT lesson_id, name, time
         FROM sessions
        WHERE lesson_id = ANY($1::uuid[])
        ORDER BY order_index ASC`,
      [lessonIds]
    ),
    query(
      `SELECT lesson_id, name, type, url
         FROM resources
        WHERE lesson_id = ANY($1::uuid[])
        ORDER BY order_index ASC`,
      [lessonIds]
    ),
  ]);

  const sessionsByLesson = sessionsResult.rows.reduce((acc, row) => {
    (acc[row.lesson_id] = acc[row.lesson_id] || []).push({
      name: row.name,
      time: row.time,
    });
    return acc;
  }, {});

  const resourcesByLesson = resourcesResult.rows.reduce((acc, row) => {
    (acc[row.lesson_id] = acc[row.lesson_id] || []).push({
      name: row.name,
      type: row.type,
      url: row.url,
    });
    return acc;
  }, {});

  return lessonsResult.rows.map((lesson) => ({
    ...lesson,
    sessions: sessionsByLesson[lesson.id] || [],
    resources: resourcesByLesson[lesson.id] || [],
  }));
};

/**
 * Fetch the full curriculum tree for a course.
 * @param {string} courseId
 * @param {object} [options]
 * @returns {Promise<Array>}
 */
const getFullCurriculum = async (courseId, options = {}) => {
  return attachCurriculum(courseId, options);
};

/**
 * Fetch a single lesson with sessions and resources.
 * @param {string} lessonId
 * @returns {Promise<object|null>}
 */
const getLessonById = async (lessonId) => {
  const lessonResult = await query(
    'SELECT * FROM lessons WHERE id = $1',
    [lessonId]
  );
  if (lessonResult.rows.length === 0) return null;

  const lesson = lessonResult.rows[0];

  const [sessionsResult, resourcesResult] = await Promise.all([
    query(
      `SELECT name, time FROM sessions
        WHERE lesson_id = $1 ORDER BY order_index ASC`,
      [lessonId]
    ),
    query(
      `SELECT name, type, url FROM resources
        WHERE lesson_id = $1 ORDER BY order_index ASC`,
      [lessonId]
    ),
  ]);

  lesson.sessions = sessionsResult.rows;
  lesson.resources = resourcesResult.rows;
  return lesson;
};

/* ============================================================================
 * ADMIN WRITES
 * ============================================================================ */

/**
 * Create a course.
 * @param {object} data
 * @returns {Promise<object>}
 */
const createCourse = async (data) => {
  const { rows } = await query(
    `INSERT INTO courses (
       slug, title, title_am, description, description_am,
       level, duration, badge, icon, thumbnail_url,
       price_etb, is_published, order_index
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      data.slug,
      data.title,
      data.titleAm ?? null,
      data.description,
      data.descriptionAm ?? null,
      data.level,
      data.duration,
      data.badge ?? null,
      data.icon ?? null,
      data.thumbnailUrl ?? null,
      data.priceEtb ?? null,
      data.isPublished ?? false,
      data.orderIndex ?? 0,
    ]
  );
  return rows[0];
};

/**
 * Update a course using a dynamic SET builder.
 *
 * Behavior:
 *   - A key PRESENT in `data` is updated (even if its value is null).
 *   - A key ABSENT from `data` is left untouched.
 *
 * This lets the admin clear fields by sending null, and prevents partial
 * updates from overwriting unrelated columns.
 *
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
const updateCourse = async (id, data) => {
  const columnMap = {
    slug: 'slug',
    title: 'title',
    titleAm: 'title_am',
    description: 'description',
    descriptionAm: 'description_am',
    level: 'level',
    duration: 'duration',
    badge: 'badge',
    icon: 'icon',
    thumbnailUrl: 'thumbnail_url',
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

  if (fields.length === 0) {
    return getCourseById(id);
  }

  fields.push('updated_at = NOW()');
  values.push(id);

  const { rows } = await query(
    `UPDATE courses SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *`,
    values
  );
  return rows[0] || null;
};

/**
 * Delete a course. Cascades to phases/weeks/lessons at DB level.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
const deleteCourse = async (id) => {
  const { rowCount } = await query('DELETE FROM courses WHERE id = $1', [id]);
  return rowCount > 0;
};

/* ============================================================================
 * INTERNAL — BATCHED CURRICULUM ASSEMBLY
 * ============================================================================ */

/**
 * Assemble a full curriculum tree with batched queries. Fixed at 4 queries
 * regardless of course size.
 *
 * @param {string} courseId
 * @param {object} [options]
 * @param {boolean} [options.includeUnpublished=false]
 * @returns {Promise<Array>}
 */
const attachCurriculum = async (courseId, options = {}) => {
  const { includeUnpublished = false } = options;

  const phases = await getPhasesByCourseId(courseId, { includeUnpublished });
  if (phases.length === 0) return [];

  const phaseIds = phases.map((p) => p.id);
  const weekFilter = includeUnpublished ? '' : 'AND is_published = true';
  const weeksResult = await query(
    `SELECT id, phase_id, week_number, title, title_am, is_published, order_index
       FROM weeks
      WHERE phase_id = ANY($1::uuid[]) ${weekFilter}
      ORDER BY week_number ASC`,
    [phaseIds]
  );
  const weeks = weeksResult.rows;

  const weeksByPhase = weeks.reduce((acc, w) => {
    (acc[w.phase_id] = acc[w.phase_id] || []).push(w);
    return acc;
  }, {});

  const weekIds = weeks.map((w) => w.id);
  let lessons = [];
  if (weekIds.length > 0) {
    const lessonFilter = includeUnpublished ? '' : 'AND is_published = true';
    const lessonsResult = await query(
      `SELECT id, week_id, title, title_am, duration, youtube_id,
              is_free_preview, notes, is_published, order_index
         FROM lessons
        WHERE week_id = ANY($1::uuid[]) ${lessonFilter}
        ORDER BY order_index ASC`,
      [weekIds]
    );
    lessons = lessonsResult.rows;
  }

  const lessonIds = lessons.map((l) => l.id);
  let sessionsByLesson = {};
  let resourcesByLesson = {};

  if (lessonIds.length > 0) {
    const [sessionsResult, resourcesResult] = await Promise.all([
      query(
        `SELECT lesson_id, name, time
           FROM sessions
          WHERE lesson_id = ANY($1::uuid[])
          ORDER BY order_index ASC`,
        [lessonIds]
      ),
      query(
        `SELECT lesson_id, name, type, url
           FROM resources
          WHERE lesson_id = ANY($1::uuid[])
          ORDER BY order_index ASC`,
        [lessonIds]
      ),
    ]);

    sessionsByLesson = sessionsResult.rows.reduce((acc, row) => {
      (acc[row.lesson_id] = acc[row.lesson_id] || []).push({
        name: row.name,
        time: row.time,
      });
      return acc;
    }, {});

    resourcesByLesson = resourcesResult.rows.reduce((acc, row) => {
      (acc[row.lesson_id] = acc[row.lesson_id] || []).push({
        name: row.name,
        type: row.type,
        url: row.url,
      });
      return acc;
    }, {});
  }

  const lessonsByWeek = lessons.reduce((acc, l) => {
    const enriched = {
      ...l,
      sessions: sessionsByLesson[l.id] || [],
      resources: resourcesByLesson[l.id] || [],
    };
    (acc[l.week_id] = acc[l.week_id] || []).push(enriched);
    return acc;
  }, {});

  return phases.map((phase) => ({
    ...phase,
    weeks: (weeksByPhase[phase.id] || []).map((week) => ({
      ...week,
      lessons: lessonsByWeek[week.id] || [],
    })),
  }));
};

module.exports = {
  getAllCourses,
  getAllCoursesForAdmin,
  getCourseBySlug,
  getCourseById,
  getCourseByIdWithCurriculum,
  getPhasesByCourseId,
  getWeeksByPhaseId,
  getLessonsByWeekId,
  getFullCurriculum,
  getLessonById,
  createCourse,
  updateCourse,
  deleteCourse,
};