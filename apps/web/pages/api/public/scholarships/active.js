/**
 * @fileoverview GET /api/public/scholarships/active
 *
 * Public (unauthenticated) endpoint. Returns active campaigns for the
 * auth page banner and any public marketing surface.
 *
 * Path: apps/web/pages/api/public/scholarships/active.js
 */

import { handleActiveCampaigns } from '../../../../lib/scholarships/http/handlers/public';

export default handleActiveCampaigns;