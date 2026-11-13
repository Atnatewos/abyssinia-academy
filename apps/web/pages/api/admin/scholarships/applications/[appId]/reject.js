/**
 * @fileoverview POST /api/admin/scholarships/applications/[appId]/reject
 *
 * Reject a scholarship application. Requires a reason. Queues a refund if
 * a registration-fee payment exists for the application.
 *
 * Path: apps/web/pages/api/admin/scholarships/applications/[appId]/reject.js
 */

import { handleAdminReject } from '../../../../../../lib/scholarships/http/handlers/admin-applications';

export default handleAdminReject;