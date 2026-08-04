/**
 * @fileoverview Access Check API Route
 * Returns the user's access map — the single source of truth for what content
 * a student can access based on their enrollment purchase_mode and selected_phases.
 * 
 * Access Map Logic:
 * - Full-course purchase → all phases, all weeks, all lessons
 * - Individual phase purchase → only purchased phases + their weeks/lessons
 * - Authenticated but not enrolled → free previews accessible, everything else locked
 * - Not authenticated → nothing accessible
 * 
 * Path: apps/web/pages/api/access/check.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    /*
     * Authenticate via JWT Bearer token
     */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    const userId = decoded.userId;

    /*
     * Fetch user enrollment status
     * Parameterized query prevents SQL injection
     */
    const userResult = await pool.query(
      `SELECT id, is_enrolled FROM users WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = userResult.rows[0];

    /*
     * If not enrolled, return an access map that allows free previews only.
     * Free preview lessons bypass phase-level locks — they act as teasers
     * to encourage purchase. The frontend checks isFreePreview per lesson.
     */
    if (!user.is_enrolled) {
      return res.status(200).json({
        success: true,
        data: {
          purchaseMode: 'none',
          accessiblePhases: [],
          accessibleWeeks: [],
          accessibleLessons: [],
          isFullCourse: false,
          isEnrolled: false,
        },
      });
    }

    /*
     * Fetch the latest enrollment record for this user
     */
    const enrollmentResult = await pool.query(
      `SELECT purchase_mode, selected_phases
       FROM enrollments
       WHERE user_id = $1
       ORDER BY enrolled_at DESC
       LIMIT 1`,
      [userId]
    );

    const enrollment = enrollmentResult.rows[0];

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        data: {
          purchaseMode: 'none',
          accessiblePhases: [],
          accessibleWeeks: [],
          accessibleLessons: [],
          isFullCourse: false,
          isEnrolled: true,
        },
      });
    }

    const isFullCourse = enrollment.purchase_mode === 'full-course' || !enrollment.selected_phases;

    /*
     * Full-course students get everything — no filtering needed
     * The frontend interprets isFullCourse = true as "access all"
     */
    if (isFullCourse) {
      return res.status(200).json({
        success: true,
        data: {
          purchaseMode: 'full-course',
          accessiblePhases: ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'],
          accessibleWeeks: [],
          accessibleLessons: [],
          isFullCourse: true,
          isEnrolled: true,
        },
      });
    }

    /*
     * Individual phase purchase — build the access map from selected_phases
     * We import the course config to cross-reference which weeks/lessons belong
     * to each purchased phase
     */
    const CourseLoader = require('../../../../../packages/shared/courses/index');
    const course = CourseLoader.getBySlug('fullstack-web-engineering-masterclass', 'en');

    const accessiblePhases = enrollment.selected_phases || [];
    const accessibleWeeks = new Set();
    const accessibleLessons = new Set();

    if (course && course.phases) {
      for (const phase of course.phases) {
        if (accessiblePhases.includes(phase.id)) {
          if (phase.weeks) {
            for (const week of phase.weeks) {
              if (week.number) accessibleWeeks.add(week.number);
              if (week.lessons) {
                for (const lesson of week.lessons) {
                  if (lesson.id) accessibleLessons.add(lesson.id);
                }
              }
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        purchaseMode: 'individual-phases',
        accessiblePhases,
        accessibleWeeks: Array.from(accessibleWeeks).sort((a, b) => a - b),
        accessibleLessons: Array.from(accessibleLessons),
        isFullCourse: false,
        isEnrolled: true,
      },
    });

  } catch (error) {
    console.error('Access check error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify access permissions.',
    });
  }
}