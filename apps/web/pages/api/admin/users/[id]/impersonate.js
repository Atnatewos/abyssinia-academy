/**
 * @fileoverview Admin Impersonate User API
 * 
 * Generates a one-time magic link token for the target user.
 * Valid for 5 minutes. Admin session is preserved.
 * 
 * Path: apps/web/pages/api/admin/users/[id]/impersonate.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import godmodeConfig from '../../../../../../../packages/shared/config/godmode.config';

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

  if (admin.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Superadmin privileges required for impersonation.' });
  }

  const userId = req.query.id;

  try {
    const userRes = await pool.query('SELECT id, full_name FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    /* Generate a short-lived token specifically for impersonation */
    const magicToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + godmodeConfig.impersonation.tokenExpiryMinutes * 60000);

    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [magicToken, expiresAt, userId]
    );

    /* Audit log */
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'user.impersonate', 'user', $2, $3, $4, $5)`,
      [
        admin.adminId,
        userId,
        JSON.stringify({ targetName: userRes.rows[0].full_name }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    /* Return the magic URL */
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const magicUrl = `${frontendUrl}/magic-login?token=${magicToken}`;

    return res.status(200).json({
      success: true,
      data: { magicUrl, expiresInMinutes: godmodeConfig.impersonation.tokenExpiryMinutes },
    });
  } catch (error) {
    console.error('[admin/impersonate] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to generate impersonation link.' });
  }
}