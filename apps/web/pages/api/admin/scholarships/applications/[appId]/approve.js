/**
 * @fileoverview POST /api/admin/scholarships/applications/[appId]/approve
 *
 * Approve a pending application.
 *
 * Path: apps/web/pages/api/admin/scholarships/applications/[appId]/approve.js
 */

import { handleAdminApprove } from '../../../../../../lib/scholarships/http/handlers/admin-applications';

export default handleAdminApprove;