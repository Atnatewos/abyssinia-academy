/**
 * @fileoverview POST /api/admin/scholarships/applications/[appId]/revoke
 *
 * Revoke an approved scholarship.
 *
 * Path: apps/web/pages/api/admin/scholarships/applications/[appId]/revoke.js
 */

import { handleAdminRevoke } from '../../../../../../lib/scholarships/http/handlers/admin-applications';

export default handleAdminRevoke;