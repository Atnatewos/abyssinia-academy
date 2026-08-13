/**
 * @fileoverview Admin Settings API
 * GET: returns all settings (DB values merged with config defaults)
 * PUT: saves settings for a specific section
 * POST: resets a section to config defaults
 * 
 * Path: apps/web/pages/api/admin/settings/index.js
 */

import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

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
   * GET — Return all settings
   */
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT setting_key, setting_value FROM admin_settings');
      const settings = {};
      for (const row of result.rows) {
        settings[row.setting_key] = row.setting_value;
      }
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      console.error('Settings fetch error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to load settings.' });
    }
  }

  /*
   * PUT — Save a setting
   */
  if (req.method === 'PUT') {
    try {
      const { key, value } = req.body;

      if (!key) {
        return res.status(400).json({ success: false, message: 'Setting key is required.' });
      }

      if (!value) {
        return res.status(400).json({ success: false, message: 'Setting value is required.' });
      }

      await query(
        `INSERT INTO admin_settings (setting_key, setting_value, updated_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (setting_key)
         DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(value), decoded.adminId]
      );

      return res.status(200).json({
        success: true,
        message: 'Settings saved successfully.',
      });
    } catch (error) {
      console.error('Settings save error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to save settings.' });
    }
  }

  /*
   * POST — Reset a setting to defaults
   */
  if (req.method === 'POST') {
    try {
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ success: false, message: 'Setting key is required.' });
      }

      await query('DELETE FROM admin_settings WHERE setting_key = $1', [key]);

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