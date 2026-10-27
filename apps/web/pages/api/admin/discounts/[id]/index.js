/**
 * @fileoverview Admin Single Discount Code API
 * Handles get, update, and delete for a single discount code.
 * Path: apps/web/pages/api/admin/discounts/[id]/index.js
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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  const { id } = req.query;

  /*
   * GET — Single discount code
   */
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM discount_codes WHERE id = $1 AND is_deleted = false', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Discount code not found.' });
      }
      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to load discount code.' });
    }
  }

  /*
   * PUT — Update a discount code
   */
  if (req.method === 'PUT') {
    try {
      const {
        code, type, value, maxTotalUses, maxUsesPerUser,
        minPurchaseAmount, eligibleForFullCourse, eligiblePhases,
        firstTimeOnly, validFrom, validUntil, description, status,
      } = req.body;

      const result = await pool.query(
        `UPDATE discount_codes
         SET code = $1, type = $2, value = $3, max_total_uses = $4,
             max_uses_per_user = $5, min_purchase_amount = $6,
             eligible_for_full_course = $7, eligible_phases = $8,
             first_time_only = $9, valid_from = $10, valid_until = $11,
             description = $12, status = $13, updated_at = CURRENT_TIMESTAMP
         WHERE id = $14 AND is_deleted = false
         RETURNING *`,
        [
          code, type, value, maxTotalUses, maxUsesPerUser,
          minPurchaseAmount, eligibleForFullCourse, eligiblePhases,
          firstTimeOnly, validFrom || null, validUntil || null,
          description || null, status, id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Discount code not found.' });
      }

      return res.status(200).json({ success: true, data: result.rows[0], message: 'Discount code updated.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update discount code.' });
    }
  }

  /*
   * DELETE — Soft delete a discount code
   */
  if (req.method === 'DELETE') {
    try {
      await pool.query('UPDATE discount_codes SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Discount code deleted.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete discount code.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}