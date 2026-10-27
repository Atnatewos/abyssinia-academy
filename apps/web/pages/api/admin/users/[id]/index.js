/**
 * @fileoverview Admin Single User Detail API
 *
 * Returns one user object (never an array) with schema-verified columns
 * AND joins the wallet balance, agent code, and agent settings so the
 * God Mode UI can render wallet adjustments, agent overrides, and
 * impersonation controls without a second fetch.
 *
 * Verified columns used:
 *   users:              id, full_name, email, phone, avatar_url, is_enrolled,
 *                       enrolled_at, direct_referral_count, total_team_size,
 *                       paying_direct_count, paying_team_size,
 *                       lifetime_referral_earnings, last_active, created_at,
 *                       updated_at, is_agent, banned_at
 *   affiliate_wallets:  current_balance, total_earned, total_withdrawn,
 *                       pending_withdrawal, debt_balance
 *   agent_codes:        code, is_active
 *   agent_settings:     commission_type, commission_value, is_active
 *
 * Path: apps/web/pages/api/admin/users/[id]/index.js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Validate and decode admin JWT from the Authorization header.
 *
 * @param {string} authHeader - Raw Authorization header value
 * @returns {object} Decoded admin payload
 * @throws {Error} With status code attached for clean routing
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
    const err = new Error('JWT_ADMIN_SECRET is not configured on the server');
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const userId = req.query.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User id is required.' });
    }

    /*
     * Single query with LATERAL joins so we hit each related table at
     * most once. Using LEFT JOIN ensures users without a wallet, agent
     * code, or agent settings still return a valid row.
     */
    const sql = `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        u.is_enrolled,
        u.enrolled_at,
        u.is_agent,
        u.banned_at,
        u.banned_reason,
        u.direct_referral_count,
        u.total_team_size,
        u.paying_direct_count,
        u.paying_team_size,
        u.lifetime_referral_earnings,
        u.last_active,
        u.created_at,
        u.updated_at,
        CASE
          WHEN u.banned_at IS NOT NULL THEN 'banned'
          WHEN u.is_enrolled = TRUE THEN 'enrolled'
          ELSE 'registered'
        END AS status,
        'user' AS role,
        w.current_balance,
        w.total_earned,
        w.total_withdrawn,
        w.pending_withdrawal,
        w.debt_balance,
        ac.code AS agent_code,
        ac.is_active AS agent_code_active,
        ags.commission_type,
        ags.commission_value,
        ags.is_active AS agent_settings_active
      FROM users u
      LEFT JOIN affiliate_wallets w ON w.user_id = u.id
      LEFT JOIN agent_codes ac ON ac.user_id = u.id
      LEFT JOIN agent_settings ags ON ags.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `;

    const result = await pool.query(sql, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[admin/users/[id]] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load user details.',
    });
  }
}