/**
 * @fileoverview GET /api/scholarships/my-applications
 *
 * List all applications for the current user. Auth required.
 *
 * Path: apps/web/pages/api/scholarships/my-applications.js
 */

import { handleListMyApplications } from '../../../lib/scholarships/http/handlers/student';

export default handleListMyApplications;