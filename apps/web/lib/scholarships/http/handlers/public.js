/**
 * @fileoverview Public Scholarship Handlers
 *
 * Endpoints that DON'T require authentication. Currently only the
 * "active campaigns" listing used by the auth page banner.
 *
 * These handlers should never return sensitive data — they run for
 * anonymous visitors.
 *
 * Path: apps/web/lib/scholarships/http/handlers/public.js
 */

import { listActiveCampaigns } from '../../service';
import { getScholarshipPublicListingConfig, isScholarshipsEnabled } from '../../../config';
import { ok, methodNotAllowed } from '../response';
import { handleError } from '../errors';

/**
 * GET /api/public/scholarships/active
 *
 * Returns the campaigns currently open for applications. Consumed by
 * the auth page banner and any public marketing surface.
 *
 * Response includes:
 *   - Campaign identity (slug, name, description)
 *   - Grant description (full course or specific phases)
 *   - Fee and quota (for scarcity display)
 *   - Timing (open/close dates)
 *
 * Caching is applied via CDN headers based on
 * scholarshipsConfig.publicListing.cacheSeconds.
 */
export const handleActiveCampaigns = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res, ['GET']);
    }

    /* Master kill switch — when disabled, return empty list (banner hides). */
    if (!isScholarshipsEnabled()) {
      return ok(res, { campaigns: [] });
    }

    const config = getScholarshipPublicListingConfig();
    const campaigns = await listActiveCampaigns({ limit: 20 });

    /*
     * Only expose fields safe for anonymous consumption. No internal IDs
     * beyond `slug`. No created_by_admin_id, no admin notes.
     */
    const sanitized = campaigns.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameAm: c.name_am,
      description: c.description,
      descriptionAm: c.description_am,
      grantsFullCourse: c.grants_full_course,
      grantsPhases: c.grants_phases,
      registrationFeeETB: Number(c.registration_fee_etb) || 0,
      quota: c.quota,
      approvedCount: config.showQuotaProgress ? c.approved_count : null,
      remaining: config.showQuotaProgress
        ? Math.max(0, c.quota - c.approved_count)
        : null,
      applicationsOpenAt: c.applications_open_at,
      applicationsCloseAt: c.applications_close_at,
      coverImageUrl: c.cover_image_url,
    }));

    /* CDN cache hint — matches config. */
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${config.cacheSeconds || 300}, stale-while-revalidate=60`
    );

    return ok(res, { campaigns: sanitized });
  } catch (error) {
    return handleError(error, res);
  }
};