/**
 * @fileoverview GET /api/scholarships/[slug]
 *
 * Returns a single campaign with eligibility checks. Auth required.
 *
 * Path: apps/web/pages/api/scholarships/[slug].js
 */

import { handleGetCampaign } from '../../../lib/scholarships/http/handlers/student';

export default handleGetCampaign;