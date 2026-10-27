/**
 * @fileoverview Admin Discount Codes API — List + Create
 * GET: returns all non-deleted discount codes
 * POST: creates a new discount code
 * Path: apps/web/pages/api/admin/discounts/index.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT * FROM discount_codes WHERE is_deleted = false ORDER BY created_at DESC`
      );
      return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Discount list error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to load discount codes.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        code, type, value, maxTotalUses, maxUsesPerUser,
        minPurchaseAmount, eligibleForFullCourse, eligiblePhases,
        firstTimeOnly, validFrom, validUntil, description, status,
      } = req.body;

      if (!code || !code.trim()) return res.status(400).json({ success: false, message: 'Code is required.' });
      if (!value || Number(value) <= 0) return res.status(400).json({ success: false, message: 'Value is required.' });

      const existing = await pool.query('SELECT id FROM discount_codes WHERE code = $1 AND is_deleted = false', [code.trim().toUpperCase()]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'A code with this name already exists.' });
      }

      const result = await pool.query(
        `INSERT INTO discount_codes
         (code, type, value, max_total_uses, max_uses_per_user, min_purchase_amount,
          eligible_for_full_course, eligible_phases, first_time_only,
          valid_from, valid_until, description, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          code.trim().toUpperCase(), type, Number(value),
          Number(maxTotalUses) || 0, Number(maxUsesPerUser) || 1,
          Number(minPurchaseAmount) || 0, eligibleForFullCourse !== false,
          eligiblePhases || null, firstTimeOnly || false,
          validFrom || null, validUntil || null,
          description?.trim() || null, status || 'active',
        ]
      );

      return res.status(201).json({ success: true, data: result.rows[0], message: 'Discount code created.' });
    } catch (error) {
      console.error('Discount create error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to create discount code.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}