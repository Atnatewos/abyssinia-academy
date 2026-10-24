/**
 * @fileoverview Agent Code Validation API
 *
 * POST /api/agents/validate
 *
 * Validates an agent code and returns the agent's commission settings.
 * Used at checkout to confirm the code is active and show the buyer
 * what discount/commission structure applies.
 *
 * Security:
 *   - Bearer student JWT required
 *   - Self-referral blocked (user cannot use their own agent code)
 *   - Parameterized SQL only
 *
 * Path: apps/web/pages/api/agents/validate.js
 */
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { getAgentConfig } from '../../../lib/config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
  const { code } = req.body || {};

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Agent code is required.' });
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const codeResult = await query(
      `SELECT ac.user_id, ac.is_active, u.full_name AS agent_name,
              ags.commission_type, ags.commission_value, ags.is_active AS settings_active
       FROM agent_codes ac
       JOIN users u ON u.id = ac.user_id
       LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
       WHERE ac.code = $1`,
      [cleanCode]
    );

    if (codeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid agent code.' });
    }

    const agentData = codeResult.rows[0];

    if (!agentData.is_active) {
      return res.status(400).json({ success: false, message: 'This agent code is no longer active.' });
    }

    if (!agentData.settings_active) {
      return res.status(400).json({ success: false, message: 'This agent account is suspended.' });
    }

    if (agentData.user_id === userId) {
      return res.status(400).json({ success: false, message: 'You cannot use your own agent code.' });
    }

    const agentConfig = getAgentConfig();
    const commissionType = agentData.commission_type || agentConfig.defaultCommission?.type || 'fixed';
    const commissionValue = parseFloat(agentData.commission_value || agentConfig.defaultCommission?.value || 0);

    res.status(200).json({
      success: true,
      data: {
        code: cleanCode,
        agentName: agentData.agent_name,
        commissionType,
        commissionValue,
        displayText: commissionType === 'fixed'
          ? `${commissionValue} ETB per sale`
          : `${commissionValue}% per sale`,
      },
    });
  } catch (error) {
    console.error('Agent validation error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to validate agent code.' });
  }
}