/**
 * @fileoverview Admin Agent Settings API
 *
 * GET    — fetch a single agent's settings + aggregates
 * PATCH  — update commission type/value or suspend/reactivate
 *
 * Gates: admin JWT required. Superadmin required for PATCH.
 *
 * Design notes:
 *   - PATCH uses a single atomic UPSERT (INSERT ... ON CONFLICT DO UPDATE)
 *     so partial updates work even when the agent has no settings row yet.
 *   - No multi-statement queries — PostgreSQL prepared statements reject
 *     them, so we always ship exactly one SQL statement per query() call.
 *   - Audit log is written after a successful upsert, in its own statement.
 *
 * Path: apps/web/pages/api/admin/agents/[id]/settings.js
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
 * Verify an admin Bearer token.
 * @param {string} authHeader
 * @returns {object} Decoded admin payload
 * @throws {Error} With .status attached
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
    const agentUserId = req.query.id;

    if (!agentUserId) {
      return res
        .status(400)
        .json({ success: false, message: 'Agent user id is required.' });
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

    /* ── PATCH: update settings (single atomic UPSERT) ── */
    if (req.method === 'PATCH') {
      if (admin.role !== 'superadmin') {
        return res
          .status(403)
          .json({ success: false, message: 'Superadmin privileges required.' });
      }

      const { commissionType, commissionValue, isActive } = req.body || {};

      /*
       * Build a validated patch payload. Undefined fields fall back to
       * safe defaults so the UPSERT always has a fully-specified row to
       * insert if the agent doesn't yet have settings.
       */
      let cleanType = 'fixed';
      let cleanValue = 500;
      let cleanActive = true;

      if (commissionType !== undefined) {
        const validTypes = ['fixed', 'percentage'];
        cleanType = String(commissionType).toLowerCase();
        if (!validTypes.includes(cleanType)) {
          return res.status(400).json({
            success: false,
            message: `commissionType must be one of: ${validTypes.join(', ')}.`,
          });
        }
      }

      if (commissionValue !== undefined) {
        cleanValue = parseFloat(commissionValue);
        if (Number.isNaN(cleanValue) || cleanValue < 0) {
          return res.status(400).json({
            success: false,
            message: 'commissionValue must be a non-negative number.',
          });
        }
      }

      if (isActive !== undefined) {
        cleanActive = Boolean(isActive);
      }

      /*
       * Handle the case where the admin sends nothing at all.
       * Instead of a confusing 400, we return the current row.
       */
      if (
        commissionType === undefined &&
        commissionValue === undefined &&
        isActive === undefined
      ) {
        return res
          .status(400)
          .json({ success: false, message: 'No fields to update.' });
      }

      /*
       * Single atomic UPSERT:
       *   - If the agent has no settings row, insert the requested values
       *     merged with safe defaults for missing fields.
       *   - If the agent has an existing row, update only the requested
       *     fields to the requested values (defaults handled below so a
       *     partial update doesn't clobber the other fields).
       *
       * Using COALESCE($N, column) lets us treat NULL params as "keep
       * existing value" — which is exactly what a partial PATCH means.
       */
      const upsertResult = await pool.query(
        `INSERT INTO agent_settings (user_id, commission_type, commission_value, is_active, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id) DO UPDATE
           SET commission_type  = COALESCE($5,  agent_settings.commission_type),
               commission_value = COALESCE($6,  agent_settings.commission_value),
               is_active        = COALESCE($7,  agent_settings.is_active),
               updated_at       = NOW()
         RETURNING user_id, commission_type, commission_value, is_active, updated_at`,
        [
          agentUserId,                                       // $1
          cleanType,                                          // $2 (insert default)
          cleanValue,                                         // $3
          cleanActive,                                        // $4
          commissionType !== undefined ? cleanType : null,   // $5
          commissionValue !== undefined ? cleanValue : null, // $6
          isActive !== undefined ? cleanActive : null,       // $7
        ]
      );

      if (upsertResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: 'Agent settings not found.' });
      }

      /* Audit log — separate statement, no multi-command */
      try {
        await pool.query(
          `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
           VALUES ($1, 'agent.settings_update', 'user', $2, $3, $4, $5)`,
          [
            admin.adminId || admin.id,
            agentUserId,
            JSON.stringify({
              commissionType,
              commissionValue,
              isActive,
            }),
            req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
            req.headers['user-agent'] || null,
          ]
        );
      } catch (auditErr) {
        /* Audit failures must never fail the actual settings update */
        console.error('[admin/agents/[id]/settings] audit log failed:', auditErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Agent settings updated.',
        data: upsertResult.rows[0],
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