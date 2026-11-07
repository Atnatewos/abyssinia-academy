/**
 * @fileoverview GET /api/admin/scholarships/applications/[appId]
 *
 * Single application detail with audit trail.
 *
 * Path: apps/web/pages/api/admin/scholarships/applications/[appId].js
 */

import { handleAdminGetApplication } from '../../../../../lib/scholarships/http/handlers/admin-applications';

export default handleAdminGetApplication;