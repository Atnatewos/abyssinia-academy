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

/**
 * @fileoverview Public Scholarship Handlers
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
 * Returns campaigns currently open for applications. Consumed by the
 * auth page banner and the /scholarships browse page.
 *
 * Caching:
 *   TTL sourced from config (default 15s). Combined with
 *   `stale-while-revalidate=30`, the CDN serves stale content while
 *   fetching fresh — zero user-facing latency, near-instant reflection
 *   of admin pause/delete edits.
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

    /*
     * Cache strategy:
     *   - s-maxage=15  : CDN caches for 15 seconds
     *   - stale-while-revalidate=30 : serve stale while fetching fresh
     *   - must-revalidate : require revalidation after expiry
     *
     * Result: pause/delete reflects within ~15-45 seconds instead of
     * the previous 5-minute lag. Combined with the browser-side fetch
     * which has `cache: 'no-store'`... wait, no, the fetch respects
     * this header. Tradeoff accepted: 15s CDN cache is worth the DB
     * offload.
     */
    const ttl = Number(config.cacheSeconds) || 15;
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${ttl}, stale-while-revalidate=30, must-revalidate`
    );

    return ok(res, { campaigns: sanitized });
  } catch (error) {
    return handleError(error, res);
  }
};