/**
 * @fileoverview Admin Unban User API
 *
 * Clears `banned_at` and `banned_reason` on the target user and (best-effort)
 * reactivates their agent + referral codes. Requires a superadmin JWT.
 *
 * Idempotent: calling this on a non-banned user is a no-op with success=true.
 *
 * Schema note:
 *   - agent_codes has updated_at (migration 017)
 *   - referral_codes does NOT have updated_at (legacy migration 004)
 *   Both columns are handled independently below.
 *
 * Path: apps/web/pages/api/admin/users/[id]/unban.js
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
 * @param {string} authHeader
 * @returns {object} Decoded admin payload
 * @throws {Error} With status code attached
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
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed.' });
  }

  let admin;
  try {
    admin = verifyAdmin(req.headers.authorization);
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }

  if (admin.role !== 'superadmin') {
    return res
      .status(403)
      .json({ success: false, message: 'Superadmin privileges required.' });
  }

  const userId = req.query.id;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: 'User id is required.' });
  }

  /* Optional operator note — surfaces in the audit log */
  const { note } = req.body || {};

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    /* Clear ban columns on the user row */
    const userResult = await client.query(
      `UPDATE users
       SET banned_at = NULL,
           banned_reason = NULL,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, full_name, banned_at`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    /*
     * Reactivate agent_codes — this table has updated_at (migration 017),
     * so we can stamp the change. Use a savepoint so a failure here does
     * not abort the whole transaction.
     */
    try {
      await client.query('SAVEPOINT agent_codes_update');
      await client.query(
        `UPDATE agent_codes
         SET is_active = true,
             updated_at = NOW()
         WHERE user_id = $1 AND is_active = false`,
        [userId]
      );
      await client.query('RELEASE SAVEPOINT agent_codes_update');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT agent_codes_update');
      console.warn('[unban] agent_codes reactivation failed:', e.message);
    }

    /*
     * Reactivate referral_codes — legacy table WITHOUT updated_at.
     * Do not stamp a nonexistent column; just flip is_active.
     */
    try {
      await client.query('SAVEPOINT referral_codes_update');
      await client.query(
        `UPDATE referral_codes
         SET is_active = true
         WHERE user_id = $1 AND is_active = false`,
        [userId]
      );
      await client.query('RELEASE SAVEPOINT referral_codes_update');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT referral_codes_update');
      console.warn('[unban] referral_codes reactivation failed:', e.message);
    }

    /* Audit log — matches shape of ban for consistency */
    await client.query(
      `INSERT INTO admin_audit_logs
         (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'user.unban', 'user', $2, $3, $4, $5)`,
      [
        admin.adminId || admin.id,
        userId,
        JSON.stringify({
          targetName: userResult.rows[0].full_name,
          note: note || null,
        }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'User unbanned successfully.',
      data: { userId },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[admin/users/[id]/unban] Error:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to unban user.' });
  } finally {
    client.release();
  }
}