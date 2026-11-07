/**
 * @fileoverview GET /api/scholarships
 *
 * Returns active campaigns + the current user's application status per
 * campaign. Auth required.
 *
 * Path: apps/web/pages/api/scholarships/index.js
 */

import { handleListCampaigns } from '../../../lib/scholarships/http/handlers/student';

export default handleListCampaigns;