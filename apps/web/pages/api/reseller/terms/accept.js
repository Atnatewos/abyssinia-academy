/**
 * @fileoverview Reseller Terms — Accept API
 *
 * POST — records that the authenticated reseller accepted the current
 * terms of service version. Idempotent: re-accepting just updates the
 * timestamp + version.
 *
 * Path: apps/web/pages/api/reseller/terms/accept.js
 */

import {
  requireReseller,
  sendSuccess,
  sendError,
  getConfig,
} from '../../../../lib/reseller-api';
import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed.');
  }

  let context;
  try {
    context = await requireReseller(req);
  } catch (err) {
    return sendError(res, err.status || 401, err.message);
  }

  const { userId, profile } = context;

  try {
    const config = await getConfig(profile.id);
    if (!config.ux.requireTermsOfService) {
      return sendSuccess(res, { alreadyAccepted: true }, 'Terms acceptance not required.');
    }

    /* Idempotent: re-accepting just updates the timestamp + version */
    const result = await query(
      `UPDATE reseller_profiles
       SET terms_accepted_at = NOW(),
           terms_version = $2,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING terms_accepted_at, terms_version`,
      [userId, config.ux.termsVersion]
    );

    return sendSuccess(res, {
      acceptedAt: result.rows[0].terms_accepted_at,
      version: result.rows[0].terms_version,
    }, 'Terms accepted.');
  } catch (err) {
    console.error('[reseller/terms/accept POST]', err.message);
    return sendError(res, 500, 'Failed to record terms acceptance.');
  }
}