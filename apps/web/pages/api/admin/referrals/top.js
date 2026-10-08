/**
 * @fileoverview Admin Top Referrers API
 *
 * Returns the leaderboard of top referrers. Users are sorted by
 * lifetime_referral_earnings DESC, filtered to users who have at least
 * one direct referral. Returns UI-friendly aliased field names.
 *
 * Path: apps/web/pages/api/admin/referrals/top.js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Validate admin JWT.
 */
const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }
  const token = authHeader.slice(7);
  const adminSecret = process.env.JWT_ADMIN_SECRET;
  if (!adminSecret) {
    const err = new Error('JWT_ADMIN_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  try {
    return jwt.verify(token, adminSecret);
  } catch {
    const err = new Error('Invalid or expired admin token');
    err.status = 401;
    throw err;
  }
};

/**
 * Parse a non-negative integer query parameter with a safe default.
 */
const parsePositiveInt = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const limit = Math.min(parsePositiveInt(req.query.limit, 50), 500);

    const sql = `
      SELECT
        id,
        full_name AS name,
        email,
        phone,
        direct_referral_count AS referral_count,
        total_team_size,
        lifetime_referral_earnings AS total_earned,
        paying_direct_count,
        paying_team_size,
        created_at
      FROM users
      WHERE direct_referral_count > 0
      ORDER BY lifetime_referral_earnings DESC, direct_referral_count DESC
      LIMIT $1
    `;

    const result = await pool.query(sql, [limit]);

    return res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load top referrers.',
    });
  }
}