/**
 * @fileoverview Admin Agent Settings API
 *
 * GET    — fetch a single agent's settings + aggregates
 * PATCH  — update commission type/value or suspend/reactivate
 *
 * Gates: admin JWT required. Superadmin recommended for PATCH.
 *
 * Path: apps/web/pages/api/admin/agents/[id]/settings.js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

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
    const agentUserId = req.query.id;

    if (!agentUserId) {
      return res.status(400).json({ success: false, message: 'Agent user id is required.' });
    }

    /* ── GET: single agent details ── */
    if (req.method === 'GET') {
      const result = await pool.query(
        `SELECT
           u.id AS user_id, u.full_name, u.email, u.phone, u.is_agent,
           ac.code AS agent_code, ac.is_active AS code_active,
           ags.commission_type, ags.commission_value, ags.is_active AS settings_active,
           COALESCE(agg.total_sales, 0) AS total_sales,
           COALESCE(agg.total_earned, 0) AS total_earned
         FROM users u
         LEFT JOIN agent_codes ac ON ac.user_id = u.id
         LEFT JOIN agent_settings ags ON ags.user_id = u.id
         LEFT JOIN LATERAL (
           SELECT
             COUNT(*)::int AS total_sales,
             COALESCE(SUM(commission_amount), 0)::numeric AS total_earned
           FROM agent_commissions
           WHERE agent_user_id = u.id AND status = 'paid'
         ) agg ON true
         WHERE u.id = $1`,
        [agentUserId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Agent not found.' });
      }

      const row = result.rows[0];
      return res.status(200).json({
        success: true,
        data: {
          userId: row.user_id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          isAgent: row.is_agent === true,
          agentCode: row.agent_code,
          codeActive: row.code_active,
          commissionType: row.commission_type || 'fixed',
          commissionValue: parseFloat(row.commission_value || 0),
          settingsActive: row.settings_active !== false,
          totalSales: parseInt(row.total_sales || 0, 10),
          totalEarned: parseFloat(row.total_earned || 0),
        },
      });
    }

    /* ── PATCH: update settings ── */
    if (req.method === 'PATCH') {
      if (admin.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Superadmin privileges required.' });
      }

      const { commissionType, commissionValue, isActive } = req.body || {};

      const updates = [];
      const params = [agentUserId];
      let paramIndex = 2;

      if (commissionType !== undefined) {
        const validTypes = ['fixed', 'percentage'];
        const cleanType = String(commissionType).toLowerCase();
        if (!validTypes.includes(cleanType)) {
          return res.status(400).json({
            success: false,
            message: `commissionType must be one of: ${validTypes.join(', ')}.`,
          });
        }
        updates.push(`commission_type = $${paramIndex}`);
        params.push(cleanType);
        paramIndex++;
      }

      if (commissionValue !== undefined) {
        const cleanValue = parseFloat(commissionValue);
        if (Number.isNaN(cleanValue) || cleanValue < 0) {
          return res.status(400).json({ success: false, message: 'commissionValue must be a non-negative number.' });
        }
        updates.push(`commission_value = $${paramIndex}`);
        params.push(cleanValue);
        paramIndex++;
      }

      if (isActive !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        params.push(Boolean(isActive));
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update.' });
      }

      updates.push('updated_at = NOW()');
      params.push(agentUserId);

      const result = await pool.query(
        `INSERT INTO agent_settings (user_id, commission_type, commission_value, is_active)
         VALUES ($1, 'fixed', 500, true)
         ON CONFLICT (user_id) DO NOTHING;
         UPDATE agent_settings
         SET ${updates.join(', ')}
         WHERE user_id = $${paramIndex}
         RETURNING user_id, commission_type, commission_value, is_active, updated_at`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Agent settings not found.' });
      }

      /* Audit log */
      await pool.query(
        `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
         VALUES ($1, 'agent.settings_update', 'user', $2, $3, $4, $5)`,
        [
          admin.adminId || admin.id,
          agentUserId,
          JSON.stringify(req.body),
          req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
          req.headers['user-agent'] || null,
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Agent settings updated.',
        data: result.rows[0],
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  } catch (error) {
    console.error('[admin/agents/[id]/settings] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to process request.',
    });
  }
}