/**
 * @fileoverview Reseller Terms — Read API
 *
 * GET — returns the current terms of service version and key points.
 * Public endpoint (no auth required) — the reseller dashboard fetches
 * this to display the ToS before the user accepts.
 *
 * Path: apps/web/pages/api/reseller/terms/index.js
 */

import { sendSuccess, sendError, getConfig } from '../../../../lib/reseller-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed.');
  }

  try {
    const config = await getConfig();
    const { i18n } = require('@shared/config');
    const strings = i18n?.translations?.en?.reseller?.terms || {};

    return sendSuccess(res, {
      version: config.ux.termsVersion,
      title: strings.title || 'Reseller Terms of Service',
      intro: strings.intro || '',
      keyPoints: strings.keyPoints || {},
      required: config.ux.requireTermsOfService,
    });
  } catch (err) {
    console.error('[reseller/terms GET]', err.message);
    return sendError(res, 500, 'Failed to load terms.');
  }
}