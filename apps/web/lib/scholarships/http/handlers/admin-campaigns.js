// /**
//  * @fileoverview Admin Campaign Handlers
//  *
//  * CRUD operations for scholarship campaigns. All handlers require a
//  * valid admin JWT via requireAdmin().
//  *
//  * Path: apps/web/lib/scholarships/http/handlers/admin-campaigns.js
//  */

// import { requireAdmin, parseJsonBody, readIntQuery, readStringQuery } from '../middleware';
// import { ok, created, methodNotAllowed } from '../response';
// import { handleError, domainError } from '../errors';
// import { validateCampaignPayload } from '../../validation';
// import { deleteCampaign } from '../../service'; // <-- ADDED THIS IMPORT
// import { query, pool } from '../../../db';

// /* ============================================================================
//  * LIST
//  * ========================================================================== */

// export const handleAdminListCampaigns = async (req, res) => {
//   try {
//     if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
//     await requireAdmin(req);

//     const status = readStringQuery(req.query, 'status', 20) || 'all';
//     const searchTerm = readStringQuery(req.query, 'q', 100);
//     const page = readIntQuery(req.query, 'page', 1, 1, 1000);
//     const pageSize = readIntQuery(req.query, 'pageSize', 50, 1, 200);
//     const offset = (page - 1) * pageSize;

//     const conditions = ['is_deleted = false'];
//     const params = [];

//     if (status === 'active') {
//       params.push(true);
//       conditions.push(`is_active = $${params.length}`);
//     } else if (status === 'paused') {
//       params.push(false);
//       conditions.push(`is_active = $${params.length}`);
//     } else if (status === 'closed') {
//       conditions.push(`applications_close_at IS NOT NULL
//                        AND applications_close_at <= CURRENT_TIMESTAMP`);
//     }

//     if (searchTerm) {
//       params.push(`%${searchTerm.toLowerCase()}%`);
//       conditions.push(
//         `(LOWER(name) LIKE $${params.length} OR LOWER(slug) LIKE $${params.length})`
//       );
//     }

//     const whereClause = conditions.length > 0
//       ? `WHERE ${conditions.join(' AND ')}`
//       : '';

//     const rowsResult = await query(
//       `SELECT id, slug, name, name_am, description, description_am,
//               grants_full_course, grants_phases,
//               registration_fee_etb, quota, approved_count,
//               applications_open_at, applications_close_at,
//               is_active, cover_image_url, required_documents,
//               learn_more_content, learn_more_url,
//               created_at, updated_at
//        FROM scholarship_campaigns
//        ${whereClause}
//        ORDER BY created_at DESC
//        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
//       [...params, pageSize, offset]
//     );

//     const countResult = await query(
//       `SELECT COUNT(*)::int AS total FROM scholarship_campaigns ${whereClause}`,
//       params
//     );

//     return ok(
//       res,
//       { campaigns: rowsResult.rows },
//       200,
//       {
//         page,
//         pageSize,
//         total: countResult.rows[0].total,
//         totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / pageSize)),
//       }
//     );
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// /* ============================================================================
//  * GET SINGLE
//  * ========================================================================== */

// export const handleAdminGetCampaign = async (req, res) => {
//   try {
//     if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
//     await requireAdmin(req);

//     const { id } = req.query;
//     const result = await query(
//       `SELECT * FROM scholarship_campaigns WHERE id = $1`,
//       [id]
//     );
//     const campaign = result.rows[0];
//     if (!campaign) throw domainError('NOT_FOUND', 'Campaign not found.');

//     const statsResult = await query(
//       `SELECT
//          COUNT(*)::int AS total_applications,
//          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
//          COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending_payment,
//          COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
//          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
//        FROM scholarship_applications
//        WHERE campaign_id = $1`,
//       [id]
//     );

//     return ok(res, {
//       campaign,
//       stats: statsResult.rows[0],
//     });
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// /* ============================================================================
//  * CREATE
//  * ========================================================================== */

// export const handleAdminCreateCampaign = async (req, res) => {
//   try {
//     if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
//     const { adminId } = await requireAdmin(req);

//     const body = parseJsonBody(req);

//     const validation = validateCampaignPayload(body);
//     if (!validation.valid) {
//       throw domainError(
//         'VALIDATION_ERROR',
//         validation.errors.join(' '),
//         validation.errors
//       );
//     }

//     const learnMoreContent =
//       typeof body.learnMoreContent === 'string' && body.learnMoreContent.trim()
//         ? body.learnMoreContent.trim()
//         : null;
//     const learnMoreUrl =
//       typeof body.learnMoreUrl === 'string' && body.learnMoreUrl.trim()
//         ? body.learnMoreUrl.trim()
//         : null;

//     const requiredDocuments = Array.isArray(body.requiredDocuments)
//       ? body.requiredDocuments.map((d) => ({
//           type: String(d.type),
//           required: d.required === true,
//         }))
//       : [];

//     const insertResult = await query(
//       `INSERT INTO scholarship_campaigns (
//          slug, name, name_am, description, description_am,
//          grants_full_course, grants_phases,
//          registration_fee_etb, quota,
//          applications_open_at, applications_close_at,
//          is_active, cover_image_url, required_documents,
//          learn_more_content, learn_more_url,
//          created_by_admin_id
//        ) VALUES (
//          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
//        )
//        RETURNING id, slug, name, is_active, created_at`,
//       [
//         body.slug,
//         body.name,
//         body.nameAm || null,
//         body.description || null,
//         body.descriptionAm || null,
//         body.grantsFullCourse === true,
//         Array.isArray(body.grantsPhases) && body.grantsPhases.length > 0
//           ? body.grantsPhases
//           : null,
//         Number(body.registrationFeeETB) || 0,
//         Number(body.quota) || 100,
//         body.applicationsOpenAt || new Date().toISOString(),
//         body.applicationsCloseAt || null,
//         body.isActive !== false,
//         body.coverImageUrl || null,
//         JSON.stringify(requiredDocuments),
//         learnMoreContent,
//         learnMoreUrl,
//         adminId,
//       ]
//     );

//     return created(res, { campaign: insertResult.rows[0] });
//   } catch (error) {
//     if (error?.code === '23505' && String(error?.constraint || '').includes('slug')) {
//       return handleError(
//         Object.assign(
//           domainError('VALIDATION_ERROR', 'A campaign with this slug already exists.'),
//           { code: 'SLUG_TAKEN' }
//         ),
//         res
//       );
//     }
//     return handleError(error, res);
//   }
// };

// /* ============================================================================
//  * UPDATE
//  * ========================================================================== */

// export const handleAdminUpdateCampaign = async (req, res) => {
//   try {
//     if (req.method !== 'PUT' && req.method !== 'PATCH') {
//       return methodNotAllowed(res, ['PUT', 'PATCH']);
//     }
//     await requireAdmin(req);

//     const { id } = req.query;
//     const body = parseJsonBody(req);

//     const existingResult = await query(
//       `SELECT * FROM scholarship_campaigns WHERE id = $1`,
//       [id]
//     );
//     const existing = existingResult.rows[0];
//     if (!existing) throw domainError('NOT_FOUND', 'Campaign not found.');

//     const merged = {
//       slug: body.slug ?? existing.slug,
//       name: body.name ?? existing.name,
//       nameAm: body.nameAm ?? existing.name_am,
//       description: body.description ?? existing.description,
//       descriptionAm: body.descriptionAm ?? existing.description_am,
//       grantsFullCourse: body.grantsFullCourse ?? existing.grants_full_course,
//       grantsPhases: body.grantsPhases ?? existing.grants_phases,
//       registrationFeeETB: body.registrationFeeETB ?? existing.registration_fee_etb,
//       quota: body.quota ?? existing.quota,
//       applicationsOpenAt: body.applicationsOpenAt ?? existing.applications_open_at,
//       applicationsCloseAt: body.applicationsCloseAt ?? existing.applications_close_at,
//       isActive: body.isActive ?? existing.is_active,
//       coverImageUrl: body.coverImageUrl ?? existing.cover_image_url,
//       requiredDocuments: body.requiredDocuments ?? existing.required_documents,
//       learnMoreContent: body.learnMoreContent ?? existing.learn_more_content,
//       learnMoreUrl: body.learnMoreUrl ?? existing.learn_more_url,
//     };

//     const validation = validateCampaignPayload(merged);
//     if (!validation.valid) {
//       throw domainError(
//         'VALIDATION_ERROR',
//         validation.errors.join(' '),
//         validation.errors
//       );
//     }

//     const learnMoreContent =
//       typeof merged.learnMoreContent === 'string' && merged.learnMoreContent.trim()
//         ? merged.learnMoreContent.trim()
//         : null;
//     const learnMoreUrl =
//       typeof merged.learnMoreUrl === 'string' && merged.learnMoreUrl.trim()
//         ? merged.learnMoreUrl.trim()
//         : null;

//     const requiredDocuments = Array.isArray(merged.requiredDocuments)
//       ? merged.requiredDocuments.map((d) => ({
//           type: String(d.type),
//           required: d.required === true,
//         }))
//       : [];

//     await query(
//       `UPDATE scholarship_campaigns
//        SET slug = $2, name = $3, name_am = $4,
//            description = $5, description_am = $6,
//            grants_full_course = $7, grants_phases = $8,
//            registration_fee_etb = $9, quota = $10,
//            applications_open_at = $11, applications_close_at = $12,
//            is_active = $13, cover_image_url = $14, required_documents = $15,
//            learn_more_content = $16, learn_more_url = $17,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $1`,
//       [
//         id,
//         merged.slug,
//         merged.name,
//         merged.nameAm,
//         merged.description,
//         merged.descriptionAm,
//         merged.grantsFullCourse,
//         merged.grantsPhases,
//         Number(merged.registrationFeeETB) || 0,
//         Number(merged.quota) || 100,
//         merged.applicationsOpenAt,
//         merged.applicationsCloseAt,
//         merged.isActive,
//         merged.coverImageUrl,
//         JSON.stringify(requiredDocuments),
//         learnMoreContent,
//         learnMoreUrl,
//       ]
//     );

//     const updatedResult = await query(
//       `SELECT * FROM scholarship_campaigns WHERE id = $1`,
//       [id]
//     );

//     return ok(res, { campaign: updatedResult.rows[0] });
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// /* ============================================================================
//  * DELETE
//  * ========================================================================== */

// export const handleAdminDeleteCampaign = async (req, res) => {
//   try {
//     if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE']);
//     const { adminId } = await requireAdmin(req);

//     const { id } = req.query;
    
//     // We pass a sanitized req meta object for the audit logs
//     const reqMeta = {
//       ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
//       userAgent: req.headers['user-agent'],
//     };

//     const result = await deleteCampaign({
//       campaignId: id,
//       adminId,
//       reqMeta,
//     });

//     return ok(res, {
//       deleted: true,
//       type: result.type,
//       campaignId: id,
//     });
//   } catch (error) {
//     return handleError(error, res);
//   }
// };









/**
 * @fileoverview Admin Campaign Handlers
 *
 * CRUD operations for scholarship campaigns. All handlers require a
 * valid admin JWT via requireAdmin().
 *
 * Path: apps/web/lib/scholarships/http/handlers/admin-campaigns.js
 */

import { requireAdmin, parseJsonBody, readIntQuery, readStringQuery } from '../middleware';
import { ok, created, methodNotAllowed } from '../response';
import { handleError, domainError } from '../errors';
import { validateCampaignPayload } from '../../validation';
import { deleteCampaign } from '../../service'; 
import { query, pool } from '../../../db';

/* ============================================================================
 * LIST
 * ========================================================================== */

export const handleAdminListCampaigns = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    await requireAdmin(req);

    const status = readStringQuery(req.query, 'status', 20) || 'all';
    const searchTerm = readStringQuery(req.query, 'q', 100);
    const page = readIntQuery(req.query, 'page', 1, 1, 1000);
    const pageSize = readIntQuery(req.query, 'pageSize', 50, 1, 200);
    const offset = (page - 1) * pageSize;

    const conditions = ['is_deleted = false'];
    const params = [];

    if (status === 'active') {
      params.push(true);
      conditions.push(`is_active = $${params.length}`);
    } else if (status === 'paused') {
      params.push(false);
      conditions.push(`is_active = $${params.length}`);
    } else if (status === 'closed') {
      conditions.push(`applications_close_at IS NOT NULL
                       AND applications_close_at <= CURRENT_TIMESTAMP`);
    }

    if (searchTerm) {
      params.push(`%${searchTerm.toLowerCase()}%`);
      conditions.push(
        `(LOWER(name) LIKE $${params.length} OR LOWER(slug) LIKE $${params.length})`
      );
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const rowsResult = await query(
      `SELECT id, slug, name, name_am, description, description_am,
              grants_full_course, grants_phases,
              registration_fee_etb, quota, approved_count,
              applications_open_at, applications_close_at,
              is_active, cover_image_url, required_documents,
              learn_more_content, learn_more_url,
              created_at, updated_at
       FROM scholarship_campaigns
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM scholarship_campaigns ${whereClause}`,
      params
    );

    return ok(
      res,
      { campaigns: rowsResult.rows },
      200,
      {
        page,
        pageSize,
        total: countResult.rows[0].total,
        totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / pageSize)),
      }
    );
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * GET SINGLE
 * ========================================================================== */

export const handleAdminGetCampaign = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    await requireAdmin(req);

    const { id } = req.query;
    const result = await query(
      `SELECT * FROM scholarship_campaigns WHERE id = $1`,
      [id]
    );
    const campaign = result.rows[0];
    if (!campaign) throw domainError('NOT_FOUND', 'Campaign not found.');

    const statsResult = await query(
      `SELECT
         COUNT(*)::int AS total_applications,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending_payment,
         COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
       FROM scholarship_applications
       WHERE campaign_id = $1`,
      [id]
    );

    return ok(res, {
      campaign,
      stats: statsResult.rows[0],
    });
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * CREATE
 * ========================================================================== */

export const handleAdminCreateCampaign = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { adminId } = await requireAdmin(req);

    const body = parseJsonBody(req);

    const validation = validateCampaignPayload(body);
    if (!validation.valid) {
      throw domainError(
        'VALIDATION_ERROR',
        validation.errors.join(' '),
        validation.errors
      );
    }

    const learnMoreContent =
      typeof body.learnMoreContent === 'string' && body.learnMoreContent.trim()
        ? body.learnMoreContent.trim()
        : null;
    const learnMoreUrl =
      typeof body.learnMoreUrl === 'string' && body.learnMoreUrl.trim()
        ? body.learnMoreUrl.trim()
        : null;

    const requiredDocuments = Array.isArray(body.requiredDocuments)
      ? body.requiredDocuments.map((d) => ({
          type: String(d.type),
          required: d.required === true,
        }))
      : [];

    const insertResult = await query(
      `INSERT INTO scholarship_campaigns (
         slug, name, name_am, description, description_am,
         grants_full_course, grants_phases,
         registration_fee_etb, quota,
         applications_open_at, applications_close_at,
         is_active, cover_image_url, required_documents,
         learn_more_content, learn_more_url,
         created_by_admin_id
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
       )
       RETURNING id, slug, name, is_active, created_at`,
      [
        body.slug,
        body.name,
        body.nameAm || null,
        body.description || null,
        body.descriptionAm || null,
        body.grantsFullCourse === true,
        Array.isArray(body.grantsPhases) && body.grantsPhases.length > 0
          ? body.grantsPhases
          : null,
        Number(body.registrationFeeETB) || 0,
        Number(body.quota) || 100,
        body.applicationsOpenAt || new Date().toISOString(),
        body.applicationsCloseAt || null,
        body.isActive !== false,
        body.coverImageUrl || null,
        JSON.stringify(requiredDocuments),
        learnMoreContent,
        learnMoreUrl,
        adminId,
      ]
    );

    return created(res, { campaign: insertResult.rows[0] });
  } catch (error) {
    if (error?.code === '23505' && String(error?.constraint || '').includes('slug')) {
      return handleError(
        Object.assign(
          domainError('VALIDATION_ERROR', 'A campaign with this slug already exists.'),
          { code: 'SLUG_TAKEN' }
        ),
        res
      );
    }
    return handleError(error, res);
  }
};

/* ============================================================================
 * UPDATE
 * ========================================================================== */

export const handleAdminUpdateCampaign = async (req, res) => {
  try {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      return methodNotAllowed(res, ['PUT', 'PATCH']);
    }
    await requireAdmin(req);

    const { id } = req.query;
    const body = parseJsonBody(req);

    const existingResult = await query(
      `SELECT * FROM scholarship_campaigns WHERE id = $1`,
      [id]
    );
    const existing = existingResult.rows[0];
    if (!existing) throw domainError('NOT_FOUND', 'Campaign not found.');

    const merged = {
      slug: body.slug ?? existing.slug,
      name: body.name ?? existing.name,
      nameAm: body.nameAm ?? existing.name_am,
      description: body.description ?? existing.description,
      descriptionAm: body.descriptionAm ?? existing.description_am,
      grantsFullCourse: body.grantsFullCourse ?? existing.grants_full_course,
      grantsPhases: body.grantsPhases ?? existing.grants_phases,
      registrationFeeETB: body.registrationFeeETB ?? existing.registration_fee_etb,
      quota: body.quota ?? existing.quota,
      applicationsOpenAt: body.applicationsOpenAt ?? existing.applications_open_at,
      applicationsCloseAt: body.applicationsCloseAt ?? existing.applications_close_at,
      isActive: body.isActive ?? existing.is_active,
      coverImageUrl: body.coverImageUrl ?? existing.cover_image_url,
      requiredDocuments: body.requiredDocuments ?? existing.required_documents,
      learnMoreContent: body.learnMoreContent ?? existing.learn_more_content,
      learnMoreUrl: body.learnMoreUrl ?? existing.learn_more_url,
    };

    const validation = validateCampaignPayload(merged);
    if (!validation.valid) {
      throw domainError(
        'VALIDATION_ERROR',
        validation.errors.join(' '),
        validation.errors
      );
    }

    const learnMoreContent =
      typeof merged.learnMoreContent === 'string' && merged.learnMoreContent.trim()
        ? merged.learnMoreContent.trim()
        : null;
    const learnMoreUrl =
      typeof merged.learnMoreUrl === 'string' && merged.learnMoreUrl.trim()
        ? merged.learnMoreUrl.trim()
        : null;

    const requiredDocuments = Array.isArray(merged.requiredDocuments)
      ? merged.requiredDocuments.map((d) => ({
          type: String(d.type),
          required: d.required === true,
        }))
      : [];

    await query(
      `UPDATE scholarship_campaigns
       SET slug = $2, name = $3, name_am = $4,
           description = $5, description_am = $6,
           grants_full_course = $7, grants_phases = $8,
           registration_fee_etb = $9, quota = $10,
           applications_open_at = $11, applications_close_at = $12,
           is_active = $13, cover_image_url = $14, required_documents = $15,
           learn_more_content = $16, learn_more_url = $17,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        id,
        merged.slug,
        merged.name,
        merged.nameAm,
        merged.description,
        merged.descriptionAm,
        merged.grantsFullCourse,
        merged.grantsPhases,
        Number(merged.registrationFeeETB) || 0,
        Number(merged.quota) || 100,
        merged.applicationsOpenAt,
        merged.applicationsCloseAt,
        merged.isActive,
        merged.coverImageUrl,
        JSON.stringify(requiredDocuments),
        learnMoreContent,
        learnMoreUrl,
      ]
    );

    const updatedResult = await query(
      `SELECT * FROM scholarship_campaigns WHERE id = $1`,
      [id]
    );

    return ok(res, { campaign: updatedResult.rows[0] });
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * DELETE
 * ========================================================================== */

export const handleAdminDeleteCampaign = async (req, res) => {
  try {
    if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE']);
    const { adminId } = await requireAdmin(req);

    const { id } = req.query;
    
    const reqMeta = {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    const result = await deleteCampaign({
      campaignId: id,
      adminId,
      reqMeta,
    });

    return ok(res, {
      deleted: true,
      type: result.type,
      campaignId: id,
    });
  } catch (error) {
    return handleError(error, res);
  }
};