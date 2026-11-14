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
 * Public (unauthenticated) endpoint. Returns active campaigns.
 *
 * Path: apps/web/pages/api/public/scholarships/active.js
 */

import { handleActiveCampaigns } from '../../../../lib/scholarships/http/handlers/public';

/* 
 * FORCE VERCEL TO BYPASS CACHE
 * 
 * By exporting these two constants, we tell Next.js this route is a 
 * pure API endpoint that must execute dynamically on every request.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default handleActiveCampaigns;