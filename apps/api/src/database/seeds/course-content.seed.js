/**
 * @fileoverview Course Content Seeder
 *
 * Idempotent seeder that ensures the DB has every phase, week, lesson,
 * session, and resource defined in the shared course config.
 *
 * Behavior:
 *   - Uses UPSERT semantics (ON CONFLICT DO NOTHING) — safe to re-run
 *   - Never overwrites admin edits already in the DB
 *   - Reads from packages/shared/courses/<course>/course.js
 *
 * Usage:
 *   node apps/api/src/database/seeds/course-content.seed.js
 *
 * Path: apps/api/src/database/seeds/course-content.seed.js
 */

require('dotenv').config({
  path: require('path').join(__dirname, '..', '..', '..', '.env'),
});

const { getClient } = require('../../config/database');

/* Load all courses from the shared config */
const fullstackCourse = require('../../../../../packages/shared/courses/fullstack-web-development/course');

/**
 * Check whether a value already exists for a unique key.
 * Returns true when the row is present.
 *
 * @param {object} client - pg client
 * @param {string} table - table name
 * @param {string} column - column to filter on
 * @param {*} value - value to match
 * @returns {Promise<object|null>} Existing row or null
 */
const findExisting = async (client, table, column, value) => {
  const { rows } = await client.query(
    `SELECT * FROM ${table} WHERE ${column} = $1 LIMIT 1`,
    [value]
  );
  return rows[0] || null;
};

/**
 * Seed one course + its full nested curriculum.
 *
 * @param {object} client - pg client
 * @param {object} course - Course object from config
 * @returns {Promise<object>} Summary counts
 */
const seedCourse = async (client, course) => {
  const summary = {
    course: 'skipped',
    phases: { inserted: 0, skipped: 0 },
    weeks: { inserted: 0, skipped: 0 },
    lessons: { inserted: 0, skipped: 0 },
    sessions: { inserted: 0, skipped: 0 },
    resources: { inserted: 0, skipped: 0 },
    outcomes: { inserted: 0, skipped: 0 },
  };

  /* ── Course ────────────────────────────────────────────────────────── */
  let courseRow = await findExisting(client, 'courses', 'slug', course.slug);
  if (!courseRow) {
    const { rows } = await client.query(
      `INSERT INTO courses (
        slug, title, title_am, description, description_am,
        level, duration, badge, icon, thumbnail_url,
        price_etb, is_published, order_index
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        course.slug,
        course.title,
        course.titleAm || null,
        course.description,
        course.descriptionAm || null,
        course.meta.level,
        course.meta.duration,
        course.meta.badge || null,
        course.meta.icon || 'Code2',
        course.meta.thumbnailUrl || null,
        course.meta.priceEtb ?? null,
        course.meta.isPublished === true,
        0,
      ]
    );
    courseRow = rows[0];
    summary.course = 'inserted';
    console.log(`  ✅ Course inserted: ${course.title}`);
  } else {
    summary.course = 'skipped';
    console.log(`  ⏭  Course exists: ${course.title}`);
  }

  /* ── Phases ────────────────────────────────────────────────────────── */
  for (const phase of course.phases || []) {
    const existingPhase = await client.query(
      `SELECT id FROM phases
        WHERE course_id = $1 AND phase_number = $2 LIMIT 1`,
      [courseRow.id, phase.number]
    );

    let phaseId;
    if (existingPhase.rows.length > 0) {
      phaseId = existingPhase.rows[0].id;
      summary.phases.skipped += 1;
      console.log(`    ⏭  Phase ${phase.number} exists`);
    } else {
      const { rows } = await client.query(
        `INSERT INTO phases (
          course_id, phase_number, title, title_am, subtitle, subtitle_am,
          description, description_am, color, duration, icon,
          price_etb, is_published, order_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          courseRow.id,
          phase.number,
          phase.title,
          phase.titleAm || null,
          phase.subtitle,
          phase.subtitleAm || null,
          phase.description,
          phase.descriptionAm || null,
          phase.color || null,
          phase.duration,
          phase.icon || null,
          phase.priceEtb ?? null,
          phase.isPublished !== false,
          phase.number,
        ]
      );
      phaseId = rows[0].id;
      summary.phases.inserted += 1;
      console.log(`    ✅ Phase ${phase.number} inserted`);

      /* Outcomes (only on newly inserted phases) */
      for (let i = 0; i < (phase.outcomes || []).length; i += 1) {
        await client.query(
          `INSERT INTO outcomes (phase_id, text, order_index)
           VALUES ($1, $2, $3)`,
          [phaseId, phase.outcomes[i], i]
        );
        summary.outcomes.inserted += 1;
      }
    }

    /* ── Weeks ──────────────────────────────────────────────────────── */
    for (const week of phase.weeks || []) {
      const existingWeek = await client.query(
        `SELECT id FROM weeks
          WHERE phase_id = $1 AND week_number = $2 LIMIT 1`,
        [phaseId, week.number]
      );

      let weekId;
      if (existingWeek.rows.length > 0) {
        weekId = existingWeek.rows[0].id;
        summary.weeks.skipped += 1;
      } else {
        const { rows } = await client.query(
          `INSERT INTO weeks (
            phase_id, week_number, title, title_am, is_published, order_index
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            phaseId,
            week.number,
            week.title,
            week.titleAm || null,
            week.isPublished !== false,
            week.number,
          ]
        );
        weekId = rows[0].id;
        summary.weeks.inserted += 1;
        console.log(
          `      ✅ Week ${week.number}: ${week.title}`
        );
      }

      /* ── Lessons ────────────────────────────────────────────────── */
      for (const lesson of week.lessons || []) {
        const existingLesson = await client.query(
          `SELECT id FROM lessons
            WHERE week_id = $1 AND title = $2 LIMIT 1`,
          [weekId, lesson.title]
        );

        let lessonId;
        if (existingLesson.rows.length > 0) {
          lessonId = existingLesson.rows[0].id;
          summary.lessons.skipped += 1;
        } else {
          const { rows } = await client.query(
            `INSERT INTO lessons (
              week_id, title, title_am, duration, youtube_id,
              is_free_preview, notes, is_published, order_index
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id`,
            [
              weekId,
              lesson.title,
              lesson.titleAm || null,
              lesson.duration || '0 mins',
              lesson.youtubeId || '',
              lesson.isFreePreview === true,
              lesson.notes || null,
              lesson.isPublished !== false,
              lesson.orderIndex || 0,
            ]
          );
          lessonId = rows[0].id;
          summary.lessons.inserted += 1;

          /* Sessions */
          for (let i = 0; i < (lesson.sessions || []).length; i += 1) {
            const s = lesson.sessions[i];
            await client.query(
              `INSERT INTO sessions (lesson_id, name, time, order_index)
               VALUES ($1, $2, $3, $4)`,
              [lessonId, s.name, s.time, i]
            );
            summary.sessions.inserted += 1;
          }

          /* Resources */
          for (let i = 0; i < (lesson.resources || []).length; i += 1) {
            const r = lesson.resources[i];
            await client.query(
              `INSERT INTO resources (lesson_id, name, type, url, order_index)
               VALUES ($1, $2, $3, $4, $5)`,
              [lessonId, r.name, r.type || 'pdf', r.url || null, i]
            );
            summary.resources.inserted += 1;
          }
        }
      }
    }
  }

  return summary;
};

/**
 * Entry point.
 */
const main = async () => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    console.log('');
    console.log('Seeding course content from shared config...');
    console.log('');

    const summary = await seedCourse(client, fullstackCourse);

    await client.query('COMMIT');

    console.log('');
    console.log('=== SUMMARY ===');
    console.log(`  Course    : ${summary.course}`);
    console.log(
      `  Phases    : ${summary.phases.inserted} inserted, ${summary.phases.skipped} skipped`
    );
    console.log(
      `  Weeks     : ${summary.weeks.inserted} inserted, ${summary.weeks.skipped} skipped`
    );
    console.log(
      `  Lessons   : ${summary.lessons.inserted} inserted, ${summary.lessons.skipped} skipped`
    );
    console.log(`  Outcomes  : ${summary.outcomes.inserted} inserted`);
    console.log(`  Sessions  : ${summary.sessions.inserted} inserted`);
    console.log(`  Resources : ${summary.resources.inserted} inserted`);
    console.log('');
    console.log('✅ Course content seeded successfully.');
    console.log('');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('');
    console.error('❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    client.release();
  }
};

main();