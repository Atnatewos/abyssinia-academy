/**
 * @fileoverview GET /api/admin/scholarships/[id]/applications
 *
 * List applications for a specific campaign.
 *
 * Path: apps/web/pages/api/admin/scholarships/[id]/applications.js
 */

import { handleAdminListApplications } from '../../../../../lib/scholarships/http/handlers/admin-applications';

export default handleAdminListApplications;