/**
 * @fileoverview Agent Code Validation API
 *
 * POST /api/agents/validate
 *
 * Validates an agent code and returns the agent's identity and commission
 * settings. Used at checkout to confirm the code is active before the
 * buyer submits payment.
 *
 * The response includes `agentUserId` so the checkout form can submit the
 * attribution as a UUID (which the submit endpoint stores directly into
 * payments.agent_id). This eliminates the code→UUID resolution mismatch
 * that previously broke agent attribution.
 *
 * Security:
 *   - Bearer student JWT required
 *   - Self-referral blocked (buyer cannot use their own agent code)
 *   - Parameterized SQL only
 *   - Commission amounts are NOT returned to the buyer (privacy — only
 *     the agent's own dashboard may see their rate)
 *
 * Path: apps/web/pages/api/agents/validate.js
 */
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { getAgentConfig } from '../../../lib/config';

/**
 * Send a structured error response.
 *
 * @param {object} res - Next.js response
 * @param {number} status - HTTP status code
 * @param {string} message - Human-readable error message
 * @returns {object} Response
 */
const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return fail(res, 405, 'Method not allowed.');
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 401, 'No token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return fail(res, 401, 'Invalid token.');
  }

  const userId = decoded.userId;
  const { code } = req.body || {};

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return fail(res, 400, 'Agent code is required.');
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const codeResult = await query(
      `SELECT ac.user_id, ac.is_active,
              u.full_name AS agent_name,
              ags.commission_type, ags.commission_value,
              ags.is_active AS settings_active
       FROM agent_codes ac
       JOIN users u ON u.id = ac.user_id
       LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
       WHERE LOWER(ac.code) = LOWER($1)`,
      [cleanCode]
    );

    if (codeResult.rows.length === 0) {
      return fail(res, 404, 'Invalid agent code.');
    }

    const agentData = codeResult.rows[0];

    if (!agentData.is_active) {
      return fail(res, 400, 'This agent code is no longer active.');
    }

    if (agentData.settings_active === false) {
      return fail(res, 400, 'This agent account is suspended.');
    }

    if (agentData.user_id === userId) {
      return fail(res, 400, 'You cannot use your own agent code.');
    }

    /*
     * Commission details are intentionally NOT included in the response.
     * The buyer only needs to know: (a) the code is valid, (b) which agent
     * it belongs to. Revealing the agent's rate would leak private business
     * data to every buyer who tries a code.
     */
    res.status(200).json({
      success: true,
      data: {
        code: cleanCode,
        agentUserId: agentData.user_id,
        agentName: agentData.agent_name,
      },
    });
  } catch (error) {
    console.error('Agent validation error:', error.message);
    return fail(res, 500, 'Failed to validate agent code.');
  }
}