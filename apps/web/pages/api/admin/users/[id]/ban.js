/**
 * @fileoverview Admin Ban User API
 * 
 * Path: apps/web/pages/api/admin/users/[id]/ban.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });

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
  const { reason, revokeCodes } = req.body;

  if (!reason || reason.length < 5) return res.status(400).json({ success: false, message: 'A valid reason is required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    /* Ban the user */
    await client.query(
      'UPDATE users SET banned_at = NOW(), banned_reason = $1 WHERE id = $2',
      [reason, userId]
    );

    /* Optionally revoke agent and referral codes */
    if (revokeCodes) {
      await client.query('UPDATE agent_codes SET is_active = false WHERE user_id = $1', [userId]);
      await client.query('UPDATE referral_codes SET is_active = false WHERE user_id = $1', [userId]);
    }

    /* Audit log */
    await client.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'user.ban', 'user', $2, $3, $4, $5)`,
      [admin.adminId, userId, JSON.stringify({ reason, revokeCodes }), req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
    );

    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'User banned successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: 'Failed to ban user.' });
  } finally {
    client.release();
  }
}