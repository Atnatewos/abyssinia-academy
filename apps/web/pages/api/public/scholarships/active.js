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
 * @fileoverview Public Scholarships API Route (Direct DB Access)
 * 
 * This route bypasses all caching and complex logic. It executes the
 * raw SQL query directly to guarantee production environments always
 * fetch the live list of active campaigns.
 *
 * Path: apps/web/pages/api/public/scholarships/active.js
 */

import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    /* 
     * Direct, raw query bypassing all services.
     * We use a grace period of 60 seconds for open_at to prevent timezone
     * issues between the DB server and Vercel servers.
     */
    const result = await query(
      `SELECT 
         id, slug, name, name_am, description, description_am,
         grants_full_course, grants_phases, registration_fee_etb,
         quota, approved_count, applications_open_at, applications_close_at,
         cover_image_url
       FROM scholarship_campaigns
       WHERE is_active = true
         AND is_deleted = false
         AND applications_open_at <= (CURRENT_TIMESTAMP + INTERVAL '60 seconds')
         AND (applications_close_at IS NULL OR applications_close_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC
       LIMIT 20`
    );

    const sanitized = result.rows.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameAm: c.name_am,
      description: c.description,
      descriptionAm: c.description_am,
      grantsFullCourse: c.grants_full_course,
      grantsPhases: c.grants_phases,
      registrationFeeETB: Number(c.registration_fee_etb) || 0,
      quota: c.quota,
      approvedCount: c.approved_count,
      remaining: Math.max(0, c.quota - c.approved_count),
      applicationsOpenAt: c.applications_open_at,
      applicationsCloseAt: c.applications_close_at,
      coverImageUrl: c.cover_image_url,
    }));

    /* Kill all caching */
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({ success: true, data: { campaigns: sanitized } });

  } catch (error) {
    console.error('[api/public/scholarships/active] FATAL ERROR:', error);
    
    /* Return the actual error in development to help debug */
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to load campaigns.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}