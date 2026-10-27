/**
 * @fileoverview Admin Force Password Reset API
 * 
 * Path: apps/web/pages/api/admin/users/[id]/reset-password.js
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

  const userId = req.query.id;

  try {
    const magicToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + godmodeConfig.passwordReset.tokenExpiryMinutes * 60000);

    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [magicToken, expiresAt, userId]
    );

    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'user.password_reset', 'user', $2, $3, $4, $5)`,
      [admin.adminId, userId, JSON.stringify({ expiresInMinutes: godmodeConfig.passwordReset.tokenExpiryMinutes }), req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.status(200).json({
      success: true,
      data: { resetUrl: `${frontendUrl}/magic-login?token=${magicToken}`, expiresInMinutes: godmodeConfig.passwordReset.tokenExpiryMinutes },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate reset link.' });
  }
}