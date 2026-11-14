// /**
//  * @fileoverview GET /api/public/scholarships/active
//  *
//  * Public (unauthenticated) endpoint. Returns active campaigns for the
//  * auth page banner and any public marketing surface.
//  *
//  * Path: apps/web/pages/api/public/scholarships/active.js
//  */

// import { handleActiveCampaigns } from '../../../../lib/scholarships/http/handlers/public';

// export default handleActiveCampaigns;



/**
 * @fileoverview GET /api/public/scholarships/active
 *
 * Public (unauthenticated) endpoint. Returns active campaigns for the
 * auth page banner and any public marketing surface.
 *
 * Path: apps/web/pages/api/public/scholarships/active.js
 */

import { handleActiveCampaigns } from '../../../../lib/scholarships/http/handlers/public';

/* 
 * Force Vercel to treat this route as dynamic (no build-time cache).
 * Since this is a public endpoint used by the landing page, we must
 * ensure Vercel fetches live campaigns instead of serving stale build data.
 */
export const dynamic = 'force-dynamic';

export default handleActiveCampaigns;