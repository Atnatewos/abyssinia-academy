/**
 * @fileoverview GET /api/admin/scholarships/stats
 *
 * Platform-wide scholarship statistics.
 *
 * Path: apps/web/pages/api/admin/scholarships/stats.js
 */

import { handleAdminStats } from '../../../../lib/scholarships/http/handlers/admin-stats';

export default handleAdminStats;