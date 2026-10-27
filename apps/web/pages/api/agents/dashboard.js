/**
 * @fileoverview Agent Dashboard API
 *
 * GET /api/agents/dashboard
 *
 * Returns the authenticated user's agent dashboard payload:
 *   - Agent code + link
 *   - Commission settings (type + value)
 *   - Total agent sales count
 *   - Total agent earnings
 *   - Funnel metrics (pending vs converted users)
 *   - Recent agent commissions (last 5)
 *
 * Self-healing: auto-generates an agent code row if the user doesn't have one.
 *
 * Path: apps/web/pages/api/agents/dashboard.js
 */
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { getAgentConfig } from '../../../lib/config';
import { buildReferralUrl } from '../../../lib/url';

/**
 * Generate a random agent code based on config.
 * @param {object} config
 * @returns {string}
 */
const generateAgentCode = (config) => {
  const prefix = config.codeGeneration?.prefix || 'AGT-';
  const length = config.codeGeneration?.length || 12;
  let chars = config.codeGeneration?.charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  if (config.codeGeneration?.excludeSimilar) {
    chars = chars.replace(/[0O1IL]/g, '');
  }
  const randomLength = Math.max(0, length - prefix.length);
  let result = prefix;
  const crypto = require('crypto');
  for (let i = 0; i < randomLength; i++) {
    result += chars[crypto.randomInt(0, chars.length)];
  }
  return result;
};

/**
 * Generate a unique agent code with collision detection.
 * @param {object} config
 * @returns {Promise<string>}
 */
const generateUniqueAgentCode = async (config) => {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateAgentCode(config);
    const existing = await query('SELECT id FROM agent_codes WHERE code = $1 LIMIT 1', [code]);
    if (existing.rows.length === 0) return code;
  }
  throw new Error(`Failed to generate a unique agent code after ${maxAttempts} attempts.`);
};

/**
 * Ensure the user has an agent code row.
 * @param {string} userId
 * @returns {Promise<object>}
 */
const ensureAgentCode = async (userId) => {
  const existing = await query(
    'SELECT code, is_active, created_at FROM agent_codes WHERE user_id = $1',
    [userId]
  );
  if (existing.rows.length > 0) return existing.rows[0];

  try {
    const config = getAgentConfig();
    const newCode = await generateUniqueAgentCode(config);
    await query('INSERT INTO agent_codes (user_id, code) VALUES ($1, $2)', [userId, newCode]);
    const inserted = await query(
      'SELECT code, is_active, created_at FROM agent_codes WHERE user_id = $1',
      [userId]
    );
    return inserted.rows[0] || { code: newCode, is_active: true, created_at: new Date() };
  } catch (genError) {
    console.error('Agent code auto-generation failed:', genError.message);
    return { code: null, is_active: false, created_at: null };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  const userId = decoded.userId;

  try {
    /* Self-healing: ensure agent code exists */
    const agentCodeRow = await ensureAgentCode(userId);
    const agentLink = agentCodeRow.code
      ? buildReferralUrl(agentCodeRow.code, req).replace('ref=', 'agent=')
      : null;

    /* Fetch agent settings */
    const settingsResult = await query(
      `SELECT commission_type, commission_value, is_active, created_at
       FROM agent_settings WHERE user_id = $1`,
      [userId]
    );
    const settings = settingsResult.rows[0] || null;

    /* 
     * Compute aggregates from agent_commissions and funnel from 
     * registered_via_agent_id.
     */
    const [totalsResult, recentResult, funnelResult] = await Promise.all([
      query(
        `SELECT
           COUNT(*)::int AS total_sales,
           COALESCE(SUM(commission_amount), 0)::numeric AS total_earned
         FROM agent_commissions
         WHERE agent_user_id = $1 AND status = 'paid'`,
        [userId]
      ),
      query(
        `SELECT ac.id, ac.source_user_id, ac.commission_type, ac.commission_amount,
                ac.sale_amount, ac.percentage_rate, ac.paid_at,
                u.full_name AS source_user_name
         FROM agent_commissions ac
         LEFT JOIN users u ON u.id = ac.source_user_id
         WHERE ac.agent_user_id = $1
         ORDER BY ac.paid_at DESC
         LIMIT 5`,
        [userId]
      ),
      query(
        `SELECT 
           COUNT(*)::int AS total_registered,
           COUNT(*) FILTER (WHERE payment_status = 'none' OR payment_status = 'pending')::int AS pending_count,
           COUNT(*) FILTER (WHERE payment_status = 'approved' OR is_enrolled = true)::int AS converted_count
         FROM users WHERE registered_via_agent_id = $1`,
        [userId]
      )
    ]);

    const totals = totalsResult.rows[0] || { total_sales: 0, total_earned: 0 };
    const funnel = funnelResult.rows[0] || { total_registered: 0, pending_count: 0, converted_count: 0 };

    res.status(200).json({
      success: true,
      data: {
        code: agentCodeRow.code,
        link: agentLink,
        isActive: agentCodeRow.is_active,
        settings: settings
          ? {
              commissionType: settings.commission_type,
              commissionValue: parseFloat(settings.commission_value),
              isActive: settings.is_active,
            }
          : null,
        funnel: {
          totalRegistered: parseInt(funnel.total_registered || 0, 10),
          pending: parseInt(funnel.pending_count || 0, 10),
          converted: parseInt(funnel.converted_count || 0, 10),
        },
        totals: {
          totalSales: parseInt(totals.total_sales || 0, 10),
          totalEarned: parseFloat(totals.total_earned || 0),
        },
        recentCommissions: recentResult.rows.map((row) => ({
          id: row.id,
          sourceUserId: row.source_user_id,
          sourceUserName: row.source_user_name || 'Anonymous',
          commissionType: row.commission_type,
          commissionAmount: parseFloat(row.commission_amount),
          saleAmount: parseFloat(row.sale_amount),
          percentageRate: parseFloat(row.percentage_rate || 0),
          paidAt: row.paid_at,
        })),
      },
    });
  } catch (error) {
    console.error('Agent dashboard error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load agent dashboard.' });
  }
}