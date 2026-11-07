/**
 * @fileoverview Admin Scholarship Stats Handler
 *
 * Platform-wide scholarship metrics for the admin dashboard.
 * Consumed by /admin/scholarships and any dashboard widget.
 *
 * Path: apps/web/lib/scholarships/http/handlers/admin-stats.js
 */

import { requireAdmin } from '../middleware';
import { ok, methodNotAllowed } from '../response';
import { handleError } from '../errors';
import { query } from '../../../db';
import { getScholarshipAnalyticsConfig } from '../../../config';

/**
 * GET /api/admin/scholarships/stats
 *
 * Returns aggregate counts + recent activity. Used by the campaigns
 * index page header cards.
 */
export const handleAdminStats = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    await requireAdmin(req);

    const analytics = getScholarshipAnalyticsConfig();
    const windowDays = analytics.recentWindowDays || 30;

    const [campaigns, applications, recentActivity] = await Promise.all([
      query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE is_active = true)::int AS active
         FROM scholarship_campaigns`
      ),
      query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
           COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending_payment,
           COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
           COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
         FROM scholarship_applications`
      ),
      query(
        `SELECT
           COUNT(*)::int AS applications_last_window
         FROM scholarship_applications
         WHERE created_at >= CURRENT_TIMESTAMP - ($1 || ' days')::interval`,
        [String(windowDays)]
      ),
    ]);

    return ok(res, {
      campaigns: campaigns.rows[0],
      applications: applications.rows[0],
      recent: {
        windowDays,
        applicationsInWindow: recentActivity.rows[0].applications_last_window,
      },
    });
  } catch (error) {
    return handleError(error, res);
  }
};