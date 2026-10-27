/**
 * @fileoverview Agent Code Lookup (Registration Page)
 *
 * GET /api/agents/validate-by-code?code=AGT-XXXX
 *
 * Public-facing lookup used by the /auth/register page when a user
 * arrives via ?agent=AGENT_CODE. It confirms the code is valid so the
 * page can display a friendly "You were invited by {name}" banner.
 *
 * Does NOT require a bearer token — the registration page is public.
 * Does NOT return the agent UUID (attribution UUID capture happens at
 * payment submit time via the pending_agent_id column on the new user).
 * Does NOT return commission rates (privacy).
 *
 * Rate-limited upstream by lib/rateLimiter.js on the /api/auth/* prefix.
 *
 * Path: apps/web/pages/api/agents/validate-by-code.js
 */
import { query } from '../../../lib/db';

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
  if (req.method !== 'GET') {
    return fail(res, 405, 'Method not allowed.');
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return fail(res, 400, 'Agent code is required.');
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const result = await query(
      `SELECT ac.user_id, ac.is_active,
              u.full_name AS agent_name,
              ags.is_active AS settings_active
       FROM agent_codes ac
       JOIN users u ON u.id = ac.user_id
       LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
       WHERE LOWER(ac.code) = LOWER($1)`,
      [cleanCode]
    );

    if (result.rows.length === 0) {
      return fail(res, 404, 'Invalid agent code.');
    }

    const agent = result.rows[0];

    if (!agent.is_active) {
      return fail(res, 400, 'This agent code is no longer active.');
    }

    if (agent.settings_active === false) {
      return fail(res, 400, 'This agent account is suspended.');
    }

    /*
     * The registration page only needs the agent's display name and the
     * canonical (uppercased) code. The internal UUID stays server-side
     * until the payment submit step resolves it from the code.
     */
    res.status(200).json({
      success: true,
      data: {
        code: cleanCode,
        agentName: agent.agent_name,
      },
    });
  } catch (error) {
    console.error('Agent code lookup error:', error.message);
    return fail(res, 500, 'Failed to lookup agent code.');
  }
}