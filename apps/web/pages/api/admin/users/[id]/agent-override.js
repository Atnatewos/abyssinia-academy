/**
 * @fileoverview Admin Agent Rate Override API
 * 
 * Path: apps/web/pages/api/admin/users/[id]/agent-override.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import godmodeConfig from '../../../../../../../packages/shared/config/godmode.config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No token provided.' });

  let admin;
  try {
    admin = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  if (admin.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Superadmin privileges required.' });

  const userId = req.query.id;
  const { commissionType, commissionValue } = req.body;

  if (!['fixed', 'percentage'].includes(commissionType)) return res.status(400).json({ success: false, message: 'Invalid commission type.' });
  const value = parseFloat(commissionValue);
  
  const limits = godmodeConfig.agentOverride;
  if (commissionType === 'fixed' && (value < limits.minFixedAmountETB || value > limits.maxFixedAmountETB)) return res.status(400).json({ success: false, message: `Fixed rate must be between ${limits.minFixedAmountETB} and ${limits.maxFixedAmountETB}.` });
  if (commissionType === 'percentage' && (value < limits.minPercentageRate || value > limits.maxPercentageRate)) return res.status(400).json({ success: false, message: `Percentage must be between ${limits.minPercentageRate}% and ${limits.maxPercentageRate}%.` });

  try {
    await pool.query(
      `INSERT INTO agent_settings (user_id, commission_type, commission_value, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (user_id) DO UPDATE
       SET commission_type = $2, commission_value = $3, is_active = true, updated_at = NOW()`,
      [userId, commissionType, value]
    );

    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'user.agent_override', 'user', $2, $3, $4, $5)`,
      [admin.adminId, userId, JSON.stringify({ commissionType, value }), req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
    );

    return res.status(200).json({ success: true, message: 'Agent rate overridden successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to override agent rate.' });
  }
}