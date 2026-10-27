/**
 * @fileoverview API to fetch an agent's code by their user ID.
 * Used by the pricing page to auto-fill the agent code at checkout.
 * 
 * Path: apps/web/pages/api/agents/code-by-user/[id].js
 */
import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Agent user ID is required.' });
  }

  try {
    const result = await query(
      `SELECT code FROM agent_codes WHERE user_id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent code not found or inactive.' });
    }

    res.status(200).json({ success: true, data: { code: result.rows[0].code } });
  } catch (error) {
    console.error('Agent code by user lookup error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to lookup agent code.' });
  }
}