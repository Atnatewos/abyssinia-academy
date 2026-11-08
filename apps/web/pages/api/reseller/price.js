/**
 * @fileoverview Reseller Price Update API
 *
 * PATCH — update the authenticated reseller's custom price.
 * Price must be within config bounds (minRetailPriceETB / maxRetailPriceETB).
 *
 * Path: apps/web/pages/api/reseller/price.js
 */

import {
  requireReseller,
  sendSuccess,
  sendError,
  getConfig,
} from '../../../lib/reseller-api';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendError(res, 405, 'Method not allowed.');
  }

  let context;
  try {
    context = await requireReseller(req);
  } catch (err) {
    return sendError(res, err.status || 401, err.message);
  }

  const { userId, profile } = context;
  const config = await getConfig(profile.id);

  try {
    const { price } = req.body || {};
    const { validateRetailPrice } = require('@shared/reseller');

    /* Validate against config bounds (throws ResellerValidationError) */
    const validatedPrice = validateRetailPrice(price, config);

    /* Update */
    const result = await query(
      `UPDATE reseller_profiles
       SET custom_price = $2, updated_at = NOW()
       WHERE user_id = $1
       RETURNING custom_price, updated_at`,
      [userId, validatedPrice]
    );

    return sendSuccess(res, {
      price: parseFloat(result.rows[0].custom_price),
      updatedAt: result.rows[0].updated_at,
    }, 'Price updated successfully.');
  } catch (err) {
    if (err.code && err.code.startsWith('PRICE_') || err.code === 'INVALID_PRICE') {
      return sendError(res, 400, err.message, err.code);
    }
    console.error('[reseller/price PATCH]', err.message);
    return sendError(res, 500, 'Failed to update price.');
  }
}