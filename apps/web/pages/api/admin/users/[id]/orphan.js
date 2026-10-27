/**
 * @fileoverview Admin Orphan User API
 * 
 * Detaches a user from their MLM tree. Removes all ancestor links.
 * 
 * Path: apps/web/pages/api/admin/users/[id]/orphan.js
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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    /* Remove all tree links where the target user is a descendant */
    const delRes = await client.query(
      'DELETE FROM referral_tree WHERE descendant_id = $1 RETURNING ancestor_id',
      [userId]
    );

    /* Remove the direct referrer link */
    await client.query('UPDATE users SET referred_by_user_id = NULL WHERE id = $1', [userId]);

    /* Recalculate structural counts for affected ancestors */
    const ancestors = delRes.rows.map(r => r.ancestor_id);
    if (ancestors.length > 0) {
      await client.query(
        `UPDATE users SET 
           direct_referral_count = GREATEST(0, direct_referral_count - 1),
           total_team_size = GREATEST(0, total_team_size - 1)
         WHERE id = ANY($1::uuid[])`,
        [ancestors]
      );
    }

    await client.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'user.orphan', 'user', $2, $3, $4, $5)`,
      [admin.adminId, userId, JSON.stringify({ affectedAncestors: ancestors.length }), req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
    );

    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'User orphaned from tree successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: 'Failed to orphan user.' });
  } finally {
    client.release();
  }
}