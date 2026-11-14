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
 * Path: apps/web/pages/api/public/scholarships/active.js
 */

import { handleActiveCampaigns } from '../../../../lib/scholarships/http/handlers/public';

/* 
 * Force Vercel to treat this route as dynamic (no build-time cache).
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default handleActiveCampaigns;