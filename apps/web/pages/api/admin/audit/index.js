/**
 * @fileoverview Admin Audit Logs API
 * Returns paginated audit logs with admin usernames.
 * Path: apps/web/pages/api/admin/audit/index.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  try {

    const result = await pool.query(
      `SELECT
         al.*,
         a.username AS admin_username
       FROM admin_audit_logs al
       LEFT JOIN admins a ON a.id = al.admin_id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Admin audit logs error:', error.message);

    /*
     * If the table doesn't exist yet, return empty instead of error
     */
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to load audit logs.',
    });
  }
}