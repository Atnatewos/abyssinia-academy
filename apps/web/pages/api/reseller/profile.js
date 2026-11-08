/**
 * @fileoverview Reseller Profile API
 *
 * GET   — return the authenticated user's reseller profile
 * PATCH — update display_name, bio, profile_image_url
 *
 * Path: apps/web/pages/api/reseller/profile.js
 */

import {
  requireReseller,
  sendSuccess,
  sendError,
  getConfig,
} from '../../../lib/reseller-api';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  let context;
  try {
    context = await requireReseller(req);
  } catch (err) {
    return sendError(res, err.status || 401, err.message);
  }

  const { userId, profile } = context;
  const config = await getConfig(profile.id);

  if (req.method === 'GET') {
    return sendSuccess(res, {
      profile: {
        id: profile.id,
        resellerCode: profile.reseller_code,
        customPrice: parseFloat(profile.custom_price),
        subSharePercent: parseFloat(profile.sub_share_percent),
        parentResellerId: profile.parent_reseller_id,
        depth: profile.depth,
        displayName: profile.display_name,
        bio: profile.bio,
        profileImageUrl: profile.profile_image_url,
        status: profile.status,
        termsAcceptedAt: profile.terms_accepted_at,
        termsVersion: profile.terms_version,
        createdAt: profile.created_at,
      },
      config: {
        minPrice: config.pricing.minRetailPriceETB,
        maxPrice: config.pricing.maxRetailPriceETB,
        platformFeePercent: config.commission.platformFeePercent,
        subReseller: {
          enabled: config.commission.subReseller.enabled,
          minSharePercent: config.commission.subReseller.minSubSharePercent,
          maxSharePercent: config.commission.subReseller.maxSubSharePercent,
        },
      },
    });
  }

  if (req.method === 'PATCH') {
    try {
      const { displayName, bio, profileImageUrl } = req.body || {};

      /* Field-level validation */
      const updates = {};
      if (displayName !== undefined) {
        const cleaned = String(displayName).trim().slice(0, 100);
        updates.display_name = cleaned || null;
      }
      if (bio !== undefined) {
        const cleaned = String(bio).trim().slice(0, 1000);
        updates.bio = cleaned || null;
      }
      if (profileImageUrl !== undefined) {
        const cleaned = String(profileImageUrl).trim();
        if (cleaned && !/^https?:\/\//i.test(cleaned)) {
          return sendError(res, 400, 'Profile image URL must start with http:// or https://');
        }
        updates.profile_image_url = cleaned || null;
      }

      if (Object.keys(updates).length === 0) {
        return sendError(res, 400, 'No fields to update.');
      }

      const fields = [];
      const values = [];
      let i = 1;
      for (const [key, val] of Object.entries(updates)) {
        fields.push(`${key} = $${i++}`);
        values.push(val);
      }
      values.push(userId);

      await query(
        `UPDATE reseller_profiles
         SET ${fields.join(', ')}, updated_at = NOW()
         WHERE user_id = $${i}`,
        values
      );

      return sendSuccess(res, { updated: true }, 'Profile updated.');
    } catch (err) {
      console.error('[reseller/profile PATCH]', err.message);
      return sendError(res, 500, 'Failed to update profile.');
    }
  }

  return sendError(res, 405, 'Method not allowed.');
}