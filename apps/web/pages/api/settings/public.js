/**
 * @fileoverview Public Settings API — Single Source of Truth
 * Returns pricing + payment methods from DB (with config fallback).
 * Used by pricing page, checkout modal, and payment submission.
 * No auth required — public data only.
 * Path: apps/web/pages/api/settings/public.js
 */

import { query } from '../../../lib/db';
import { getPricing, getActivePaymentMethods } from '../../../lib/config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    /*
     * Fetch both pricing and payment_methods from database
     */
    const result = await query(
      `SELECT setting_key, setting_value
       FROM admin_settings
       WHERE setting_key IN ('pricing', 'payment_methods')`
    );

    const dbSettings = {};
    for (const row of result.rows) {
      dbSettings[row.setting_key] = row.setting_value;
    }

    /*
     * DB-first resolution with config fallback
     */
    const pricing = dbSettings.pricing || getPricing();
    const paymentMethods = dbSettings.payment_methods || getActivePaymentMethods();

    return res.status(200).json({
      success: true,
      data: {
        pricing,
        paymentMethods,
      },
    });
  } catch (error) {
    console.error('Public settings error:', error.message);

    /*
     * Fallback to static config if DB unreachable
     */
    return res.status(200).json({
      success: true,
      data: {
        pricing: getPricing(),
        paymentMethods: getActivePaymentMethods(),
      },
    });
  }
}