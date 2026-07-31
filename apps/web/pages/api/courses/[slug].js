/**
 * @fileoverview Get Course by Slug API Route
 * Path: apps/web/pages/api/courses/[slug].js
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    const courseResult = await pool.query(
      `SELECT id, slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url
       FROM courses WHERE slug = $1 AND is_published = true`,
      [slug]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const course = courseResult.rows[0];

    const phasesResult = await pool.query(
      `SELECT id, phase_number, title, title_am, subtitle, subtitle_am, description, description_am, color, duration, icon
       FROM phases WHERE course_id = $1 ORDER BY phase_number ASC`,
      [course.id]
    );

    course.phases = phasesResult.rows;

    for (const phase of course.phases) {
      const outcomesResult = await pool.query(
        'SELECT text FROM outcomes WHERE phase_id = $1 ORDER BY order_index ASC',
        [phase.id]
      );
      phase.outcomes = outcomesResult.rows.map((o) => o.text);

      const weeksResult = await pool.query(
        'SELECT id, week_number, title, title_am FROM weeks WHERE phase_id = $1 ORDER BY week_number ASC',
        [phase.id]
      );
      phase.weeks = weeksResult.rows;

      for (const week of phase.weeks) {
        const lessonsResult = await pool.query(
          `SELECT id, title, title_am, duration, youtube_id, is_free_preview, notes
           FROM lessons WHERE week_id = $1 ORDER BY order_index ASC`,
          [week.id]
        );
        week.lessons = lessonsResult.rows;

        for (const lesson of week.lessons) {
          const sessionsResult = await pool.query(
            'SELECT name, time FROM sessions WHERE lesson_id = $1 ORDER BY order_index ASC',
            [lesson.id]
          );
          lesson.sessions = sessionsResult.rows;

          const resourcesResult = await pool.query(
            'SELECT name FROM resources WHERE lesson_id = $1 ORDER BY order_index ASC',
            [lesson.id]
          );
          lesson.resources = resourcesResult.rows.map((r) => r.name);
        }
      }
    }

    res.json({ success: true, data: { course } });
  } catch (error) {
    console.error('Course detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to load course.' });
  }
}