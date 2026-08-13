/**
 * @fileoverview Admin Settings API
 * GET: returns all settings (DB values merged with config defaults)
 * PUT: saves settings for a specific section
 * POST: resets a section to config defaults
 * 
 * Path: apps/web/pages/api/admin/settings/index.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { saveSetting, deleteSetting, fetchAllSettingsFromDB } from '../../../../lib/settings';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

export default async function handler(req, res) {
  /*
   * Authenticate admin
   */
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  /*
   * GET — Return all settings from DB
   */
  if (req.method === 'GET') {
    try {
      const settings = await fetchAllSettingsFromDB();
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      console.error('Settings fetch error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to load settings.' });
    }
  }

  /*
   * PUT — Save a setting section
   * Body: { key: 'pricing', value: { ... } }
   */
  if (req.method === 'PUT') {
    try {
      const { key, value } = req.body;

      if (!key) {
        return res.status(400).json({ success: false, message: 'Setting key is required.' });
      }

      if (!value || typeof value !== 'object') {
        return res.status(400).json({ success: false, message: 'Setting value must be an object.' });
      }

      /*
       * Validate specific keys
       */
      if (key === 'pricing') {
        if (value.fullCourse?.amountETB && Number(value.fullCourse.amountETB) <= 0) {
          return res.status(400).json({ success: false, message: 'Full course price must be greater than 0.' });
        }
        if (value.perPhase?.amountETB && Number(value.perPhase.amountETB) <= 0) {
          return res.status(400).json({ success: false, message: 'Per-phase price must be greater than 0.' });
        }
      }

      if (key === 'payment_methods') {
        if (!Array.isArray(value)) {
          return res.status(400).json({ success: false, message: 'Payment methods must be an array.' });
        }
      }

      const saved = await saveSetting(key, value, decoded.adminId);

      return res.status(200).json({
        success: true,
        message: 'Settings saved successfully.',
        data: saved,
      });
    } catch (error) {
      console.error('Settings save error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to save settings.' });
    }
  }

  /*
   * POST — Reset a setting section to config defaults
   * Body: { key: 'pricing' }
   */
  if (req.method === 'POST') {
    try {
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ success: false, message: 'Setting key is required.' });
      }

      await deleteSetting(key);

      return res.status(200).json({
        success: true,
        message: 'Settings reset to defaults.',
      });
    } catch (error) {
      console.error('Settings reset error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to reset settings.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}