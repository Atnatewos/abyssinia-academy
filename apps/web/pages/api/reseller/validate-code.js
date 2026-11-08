/**
 * @fileoverview Reseller Code Validation API
 *
 * POST — validate a reseller code at checkout.
 *
 * Public endpoint (no auth required) — the checkout flow calls this to
 * show the buyer "Sold by {name}" before they pay.
 *
 * Rate-limited upstream by rateLimiter on /api/* prefix.
 *
 * Path: apps/web/pages/api/reseller/validate-code.js
 */

import { sendSuccess, sendError } from '../../../lib/reseller-api';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed.');
  }

  try {
    const { code } = req.body || {};

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return sendError(res, 400, 'Reseller code is required.');
    }

    const cleanCode = code.trim().toUpperCase();

    /* Parameterized query — no SQL injection */
    const result = await query(
      `SELECT rp.id, rp.user_id, rp.reseller_code, rp.custom_price, rp.status,
              u.full_name AS display_name
       FROM reseller_profiles rp
       JOIN users u ON u.id = rp.user_id
       WHERE rp.reseller_code = $1`,
      [cleanCode]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Invalid reseller code.', 'CODE_NOT_FOUND');
    }

    const r = result.rows[0];

    if (r.status !== 'active') {
      return sendError(res, 400, 'This reseller code is no longer active.', 'CODE_INACTIVE');
    }

    /* Never expose the reseller's user_id or internal IDs to the public */
    return sendSuccess(res, {
      code: r.reseller_code,
      displayName: r.display_name,
      price: parseFloat(r.custom_price),
    });
  } catch (err) {
    console.error('[reseller/validate-code]', err.message);
    return sendError(res, 500, 'Failed to validate reseller code.');
  }
}