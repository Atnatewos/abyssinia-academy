// /**
//  * @fileoverview GET /api/scholarships
//  *
//  * Returns active campaigns + the current user's application status per
//  * campaign. Auth required.
//  *
//  * Path: apps/web/pages/api/scholarships/index.js
//  */

// import { handleListCampaigns } from '../../../lib/scholarships/http/handlers/student';

// export default handleListCampaigns;




/**
 * @fileoverview GET /api/scholarships
 *
 * Returns active campaigns + the current user's application status per
 * campaign. Auth required.
 *
 * Path: apps/web/pages/api/scholarships/index.js
 */

import { handleListCampaigns } from '../../../lib/scholarships/http/handlers/student';

/* 
 * Force Vercel to treat this route as dynamic (no build-time cache).
 * This ensures the campaigns list always fetches live data from the DB.
 */
export const dynamic = 'force-dynamic';

export default handleListCampaigns;