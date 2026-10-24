/**
 * @fileoverview Admin Agents List + Create API
 *
 * GET  — list all agents with their commission settings and aggregates
 * POST — create a new agent entry (or activate an existing user as agent)
 *
 * Gates: admin JWT required. Superadmin recommended for POST.
 *
 * Path: apps/web/pages/api/admin/agents/index.js
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
 * Validate and decode admin JWT from the Authorization header.
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
  try {
    const admin = verifyAdmin(req.headers.authorization);

    /* ── GET: list agents ── */
    if (req.method === 'GET') {
      const statusFilter = req.query.status || 'all';
      const search = (req.query.search || '').trim();
      const searchPattern = search ? `%${search}%` : '%';

      let statusClause = '';
      const statusParams = [];
      if (statusFilter === 'active') {
        statusClause = 'AND ags.is_active = true';
      } else if (statusFilter === 'suspended') {
        statusClause = 'AND ags.is_active = false';
      }

      const result = await pool.query(
        `SELECT
           u.id AS user_id,
           u.full_name,
           u.email,
           u.phone,
           ac.code AS agent_code,
           ac.is_active AS code_active,
           ags.commission_type,
           ags.commission_value,
           ags.is_active AS settings_active,
           ags.created_at AS settings_created_at,
           COALESCE(agg.total_sales, 0) AS total_sales,
           COALESCE(agg.total_earned, 0) AS total_earned
         FROM users u
         JOIN agent_codes ac ON ac.user_id = u.id
         LEFT JOIN agent_settings ags ON ags.user_id = u.id
         LEFT JOIN LATERAL (
           SELECT
             COUNT(*)::int AS total_sales,
             COALESCE(SUM(commission_amount), 0)::numeric AS total_earned
           FROM agent_commissions
           WHERE agent_user_id = u.id AND status = 'paid'
         ) agg ON true
         WHERE (
           $1 = '%'
           OR u.full_name ILIKE $1
           OR u.email ILIKE $1
           OR u.phone ILIKE $1
           OR ac.code ILIKE $1
         )
         ${statusClause}
         ORDER BY agg.total_earned DESC NULLS LAST, u.created_at DESC
         LIMIT 200`,
        [searchPattern]
      );

      return res.status(200).json({
        success: true,
        data: result.rows.map((row) => ({
          userId: row.user_id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          agentCode: row.agent_code,
          codeActive: row.code_active,
          commissionType: row.commission_type || 'fixed',
          commissionValue: parseFloat(row.commission_value || 0),
          settingsActive: row.settings_active !== false,
          totalSales: parseInt(row.total_sales || 0, 10),
          totalEarned: parseFloat(row.total_earned || 0),
        })),
      });
    }

    /* ── POST: create/activate agent ── */
    if (req.method === 'POST') {
      if (admin.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Superadmin privileges required.' });
      }

      const { userId, commissionType, commissionValue } = req.body || {};

      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required.' });
      }

      const validTypes = ['fixed', 'percentage'];
      const cleanType = (commissionType || 'fixed').toLowerCase();
      if (!validTypes.includes(cleanType)) {
        return res.status(400).json({
          success: false,
          message: `commissionType must be one of: ${validTypes.join(', ')}.`,
        });
      }

      const cleanValue = parseFloat(commissionValue);
      if (Number.isNaN(cleanValue) || cleanValue < 0) {
        return res.status(400).json({ success: false, message: 'commissionValue must be a non-negative number.' });
      }

      /* Upsert agent_settings */
      const settingsResult = await pool.query(
        `INSERT INTO agent_settings (user_id, commission_type, commission_value, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (user_id) DO UPDATE
         SET commission_type = $2, commission_value = $3, is_active = true, updated_at = NOW()
         RETURNING user_id, commission_type, commission_value, is_active`,
        [userId, cleanType, cleanValue]
      );

      /* Ensure agent_codes row exists */
      await pool.query(
        `INSERT INTO agent_codes (user_id, code, is_active)
         SELECT $1, 'AGT-' || LEFT(REPLACE($1::text, '-', ''), 8), true
         WHERE NOT EXISTS (SELECT 1 FROM agent_codes WHERE user_id = $1)`,
        [userId]
      );

      /* Mark user as agent */
      await pool.query(
        `UPDATE users SET is_agent = true, updated_at = NOW() WHERE id = $1`,
        [userId]
      );

      /* Audit log */
      await pool.query(
        `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
         VALUES ($1, 'agent.create', 'user', $2, $3, $4, $5)`,
        [
          admin.adminId || admin.id,
          userId,
          JSON.stringify({ commissionType: cleanType, commissionValue: cleanValue }),
          req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
          req.headers['user-agent'] || null,
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Agent activated successfully.',
        data: settingsResult.rows[0],
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  } catch (error) {
    console.error('[admin/agents] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to process request.',
    });
  }
}