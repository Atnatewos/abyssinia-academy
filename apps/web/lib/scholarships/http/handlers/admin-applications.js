// /**
//  * @fileoverview Admin Application Review Handlers
//  *
//  * Actions an admin can take on a scholarship application. All handlers
//  * require admin JWT. All flow through lib/scholarships/service.js.
//  *
//  * Two distinct approval paths for paid campaigns:
//  *   1. Verify Payment — confirms money arrived (transitions app to 'pending')
//  *   2. Approve Application — grants scholarship (transitions to 'approved')
//  *
//  * Rejection + revocation handled separately below.
//  *
//  * Path: apps/web/lib/scholarships/http/handlers/admin-applications.js
//  */

// /**
//  * @fileoverview Admin Application Handlers
//  *
//  * Path: apps/web/lib/scholarships/http/handlers/admin-applications.js
//  */

// import { requireAdmin, parseJsonBody, readIntQuery, readStringQuery } from '../middleware';
// import { ok, methodNotAllowed } from '../response';
// import { handleError, domainError } from '../errors';
// import {
//   approveApplication,
//   rejectApplication,
//   revokeApplication,
//   verifyPayment,
// } from '../../service';
// import { query, pool } from '../../../db';

// export const handleAdminListApplications = async (req, res) => {
//   try {
//     if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
//     await requireAdmin(req);

//     const { id: campaignId } = req.query;
//     const status = readStringQuery(req.query, 'status', 30) || 'all';
//     const searchTerm = readStringQuery(req.query, 'q', 100);
//     const page = readIntQuery(req.query, 'page', 1, 1, 1000);
//     const pageSize = readIntQuery(req.query, 'pageSize', 25, 1, 200);
//     const offset = (page - 1) * pageSize;

//     const conditions = ['a.campaign_id = $1'];
//     const params = [campaignId];

//     if (status !== 'all') {
//       params.push(status);
//       conditions.push(`a.status = $${params.length}`);
//     }
//     if (searchTerm) {
//       params.push(`%${searchTerm.toLowerCase()}%`);
//       conditions.push(
//         `(LOWER(u.full_name) LIKE $${params.length}
//           OR u.phone LIKE $${params.length}
//           OR LOWER(u.email) LIKE $${params.length})`
//       );
//     }
//     const whereClause = `WHERE ${conditions.join(' AND ')}`;

//     const rowsResult = await query(
//       `SELECT a.id, a.status, a.created_at, a.reviewed_at,
//               a.rejection_reason, a.payment_due_at,
//               a.enrollment_created_at, a.revoked_at,
//               a.refund_status, a.refund_amount_etb,
//               u.id AS applicant_id, u.full_name AS applicant_name,
//               u.phone AS applicant_phone, u.email AS applicant_email
//        FROM scholarship_applications a
//        JOIN users u ON u.id = a.applicant_user_id
//        ${whereClause}
//        ORDER BY
//          CASE a.status
//            WHEN 'pending_payment' THEN 0
//            WHEN 'pending' THEN 1
//            ELSE 2
//          END,
//          a.created_at ASC
//        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
//       [...params, pageSize, offset]
//     );

//     const countResult = await query(
//       `SELECT COUNT(*)::int AS total
//        FROM scholarship_applications a
//        JOIN users u ON u.id = a.applicant_user_id
//        ${whereClause}`,
//       params
//     );

//     return ok(
//       res,
//       { applications: rowsResult.rows },
//       200,
//       {
//         page, pageSize,
//         total: countResult.rows[0].total,
//         totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / pageSize)),
//       }
//     );
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// export const handleAdminGetApplication = async (req, res) => {
//   try {
//     if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
//     await requireAdmin(req);

//     const { appId } = req.query;
//     const result = await query(
//       `SELECT a.*, c.name AS campaign_name, c.slug AS campaign_slug,
//               c.registration_fee_etb,
//               u.full_name AS applicant_name, u.phone AS applicant_phone,
//               u.email AS applicant_email,
//               (u.banned_at IS NOT NULL) AS is_banned
//        FROM scholarship_applications a
//        JOIN scholarship_campaigns c ON c.id = a.campaign_id
//        JOIN users u ON u.id = a.applicant_user_id
//        WHERE a.id = $1`,
//       [appId]
//     );
//     const application = result.rows[0];
//     if (!application) throw domainError('NOT_FOUND', 'Application not found.');

//     const eventsResult = await query(
//       `SELECT id, event_type, actor_user_id, actor_admin_id, payload, created_at
//        FROM scholarship_application_events
//        WHERE application_id = $1
//        ORDER BY created_at DESC`,
//       [appId]
//     );

//     const paymentResult = await query(
//       `SELECT id, amount, method, status, reference,
//               transaction_id AS screenshot_url, paid_at
//        FROM payments
//        WHERE scholarship_application_id = $1
//        ORDER BY created_at DESC LIMIT 1`,
//       [appId]
//     );

//     return ok(res, {
//       application,
//       events: eventsResult.rows,
//       payment: paymentResult.rows[0] || null,
//     });
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// export const handleAdminVerifyPayment = async (req, res) => {
//   try {
//     if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
//     const { adminId } = await requireAdmin(req);
//     const { appId } = req.query;
//     const body = parseJsonBody(req);
//     const result = await verifyPayment({
//       applicationId: appId,
//       adminId,
//       note: body.note ? String(body.note).slice(0, 2000) : null,
//     });
//     return ok(res, result);
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// export const handleAdminApprove = async (req, res) => {
//   try {
//     if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
//     const { adminId } = await requireAdmin(req);
//     const { appId } = req.query;
//     const body = parseJsonBody(req);
//     const result = await approveApplication({
//       applicationId: appId,
//       adminId,
//       note: body.note ? String(body.note).slice(0, 2000) : null,
//     });
//     return ok(res, result);
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// export const handleAdminReject = async (req, res) => {
//   try {
//     if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
//     const { adminId } = await requireAdmin(req);
//     const { appId } = req.query;
//     const body = parseJsonBody(req);
//     const reason = String(body.reason || '').trim();
//     if (!reason) throw domainError('REASON_REQUIRED', 'A rejection reason is required.');
//     const result = await rejectApplication({
//       applicationId: appId,
//       adminId,
//       reason: reason.slice(0, 2000),
//       note: body.note ? String(body.note).slice(0, 2000) : null,
//     });
//     return ok(res, result);
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// export const handleAdminRevoke = async (req, res) => {
//   try {
//     if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
//     const { adminId } = await requireAdmin(req);
//     const { appId } = req.query;
//     const body = parseJsonBody(req);
//     const reason = String(body.reason || '').trim();
//     if (!reason) throw domainError('REASON_REQUIRED', 'A revocation reason is required.');
//     const result = await revokeApplication({
//       applicationId: appId,
//       adminId,
//       reason: reason.slice(0, 2000),
//     });
//     return ok(res, result);
//   } catch (error) {
//     return handleError(error, res);
//   }
// };

// export const handleMarkRefunded = async (req, res) => {
//   try {
//     if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
//     const { adminId } = await requireAdmin(req);
//     const { appId } = req.query;
//     const body = parseJsonBody(req);

//     const client = await pool.connect();
//     try {
//       await client.query('BEGIN');
//       const appResult = await client.query(
//         `SELECT id, applicant_user_id, campaign_id, status,
//                 refund_status, refund_amount_etb
//          FROM scholarship_applications WHERE id = $1 FOR UPDATE`,
//         [appId]
//       );
//       const application = appResult.rows[0];
//       if (!application) throw domainError('NOT_FOUND', 'Application not found.');
//       if (application.refund_status !== 'pending') {
//         throw domainError('INVALID_STATE', `Refund is "${application.refund_status}".`);
//       }

//       await client.query(
//         `UPDATE scholarship_applications
//          SET refund_status = 'completed',
//              refund_processed_at = CURRENT_TIMESTAMP,
//              refund_processed_by = $2,
//              refund_note = COALESCE($3, refund_note)
//          WHERE id = $1`,
//         [appId, adminId, body.note ? String(body.note).slice(0, 2000) : null]
//       );
//       await client.query(
//         `UPDATE payments SET status = 'refunded'
//          WHERE scholarship_application_id = $1 AND status = 'refund_pending'`,
//         [appId]
//       );
//       await client.query(
//         `INSERT INTO admin_audit_logs
//            (admin_id, action, target_type, target_id, details, ip_address, user_agent)
//          VALUES ($1, 'scholarship.refund.completed', 'scholarship_application', $2, $3, $4, $5)`,
//         [
//           adminId, appId,
//           JSON.stringify({ amount: application.refund_amount_etb, note: body.note || null }),
//           req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
//           req.headers['user-agent'] || null,
//         ]
//       );
//       await client.query(
//         `INSERT INTO scholarship_application_events
//            (application_id, event_type, actor_admin_id, payload)
//          VALUES ($1, 'refund_completed', $2, $3)`,
//         [appId, adminId, JSON.stringify({ amount: application.refund_amount_etb, note: body.note || null })]
//       );
//       const campaignResult = await client.query(
//         `SELECT name FROM scholarship_campaigns WHERE id = $1`,
//         [application.campaign_id]
//       );
//       const campaignName = campaignResult.rows[0]?.name || 'the campaign';
//       await client.query('COMMIT');

//       const { notify } = await import('../../../notifications');
//       notify(
//         application.applicant_user_id,
//         'scholarship_refund_completed',
//         { campaign: campaignName, amount: Number(application.refund_amount_etb) || 0 },
//         '/profile/scholarships'
//       ).catch(() => {});

//       return ok(res, { refundStatus: 'completed' });
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     return handleError(error, res);
//   }
// };




/**
 * @fileoverview Admin Application Review Handlers
 *
 * Actions an admin can take on a scholarship application. All handlers
 * require admin JWT and flow through the service layer. Every handler
 * passes a sanitized request metadata object into the service so admin
 * audit rows can capture IP and user-agent consistently across Next.js
 * and Express.
 *
 * Model-A specific rules:
 *   - `pending` + paid campaign  → action is "Verify Payment"
 *   - `payment_verified`         → action is "Approve" / "Reject"
 *   - `pending` + free campaign  → action is "Approve" / "Reject"
 *
 * Path: apps/web/lib/scholarships/http/handlers/admin-applications.js
 */

import {
  requireAdmin,
  parseJsonBody,
  readIntQuery,
  readStringQuery,
} from '../middleware';
import { ok, methodNotAllowed } from '../response';
import { handleError, domainError } from '../errors';
import {
  approveApplication,
  rejectApplication,
  revokeApplication,
  verifyPayment,
  markRefundCompleted,
} from '../../service';
import { query } from '../../../db';

/**
 * Extract safe audit metadata from a Next.js request object.
 * The service layer's `auditAdminAction` expects `{ ip, userAgent }`.
 * Passing the raw Next.js `req` object would fail because it lacks
 * the Express-specific `socket.remoteAddress` property.
 *
 * @param {import('next').NextApiRequest} req
 * @returns {{ ip: string|null, userAgent: string|null }}
 */
const extractReqMeta = (req) => {
  let ip = null;
  let userAgent = null;

  try {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      ip = forwarded.split(',')[0].trim();
    } else if (req.socket && req.socket.remoteAddress) {
      ip = req.socket.remoteAddress;
    }
    userAgent = req.headers['user-agent'] || null;
  } catch {
    /* Fail closed — audit fields become null */
  }

  return { ip, userAgent };
};

/* ============================================================================
 * LIST APPLICATIONS
 * ========================================================================== */

export const handleAdminListApplications = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    await requireAdmin(req);

    const { id: campaignId } = req.query;
    const status = readStringQuery(req.query, 'status', 30) || 'all';
    const searchTerm = readStringQuery(req.query, 'q', 100);
    const page = readIntQuery(req.query, 'page', 1, 1, 1000);
    const pageSize = readIntQuery(req.query, 'pageSize', 25, 1, 200);
    const offset = (page - 1) * pageSize;

    const conditions = ['a.campaign_id = $1'];
    const params = [campaignId];

    if (status !== 'all') {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }
    if (searchTerm) {
      params.push(`%${searchTerm.toLowerCase()}%`);
      conditions.push(
        `(LOWER(u.full_name) LIKE $${params.length}
          OR u.phone LIKE $${params.length}
          OR LOWER(u.email) LIKE $${params.length})`
      );
    }
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const rowsResult = await query(
      `SELECT a.id, a.status, a.created_at, a.reviewed_at,
              a.rejection_reason, a.payment_due_at,
              a.enrollment_created_at, a.revoked_at,
              a.refund_status, a.refund_amount_etb,
              u.id AS applicant_id, u.full_name AS applicant_name,
              u.phone AS applicant_phone, u.email AS applicant_email
       FROM scholarship_applications a
       JOIN users u ON u.id = a.applicant_user_id
       ${whereClause}
       ORDER BY
         CASE a.status
           WHEN 'pending' THEN 0
           WHEN 'payment_verified' THEN 1
           ELSE 2
         END,
         a.created_at ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM scholarship_applications a
       JOIN users u ON u.id = a.applicant_user_id
       ${whereClause}`,
      params
    );

    return ok(
      res,
      { applications: rowsResult.rows },
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
 * GET APPLICATION DETAIL
 * ========================================================================== */

export const handleAdminGetApplication = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    await requireAdmin(req);

    const { appId } = req.query;
    const result = await query(
      `SELECT a.*, c.name AS campaign_name, c.slug AS campaign_slug,
              c.registration_fee_etb,
              u.full_name AS applicant_name, u.phone AS applicant_phone,
              u.email AS applicant_email,
              (u.banned_at IS NOT NULL) AS is_banned
       FROM scholarship_applications a
       JOIN scholarship_campaigns c ON c.id = a.campaign_id
       JOIN users u ON u.id = a.applicant_user_id
       WHERE a.id = $1`,
      [appId]
    );
    const application = result.rows[0];
    if (!application) throw domainError('NOT_FOUND', 'Application not found.');

    const eventsResult = await query(
      `SELECT id, event_type, actor_user_id, actor_admin_id, payload, created_at
       FROM scholarship_application_events
       WHERE application_id = $1
       ORDER BY created_at DESC`,
      [appId]
    );

    const paymentResult = await query(
      `SELECT id, amount, method, status, reference,
              transaction_id AS screenshot_url, paid_at, created_at
       FROM payments
       WHERE scholarship_application_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [appId]
    );

    return ok(res, {
      application,
      events: eventsResult.rows,
      payment: paymentResult.rows[0] || null,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * VERIFY PAYMENT
 * ========================================================================== */

export const handleAdminVerifyPayment = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { adminId } = await requireAdmin(req);
    const { appId } = req.query;
    const body = parseJsonBody(req);
    const result = await verifyPayment({
      applicationId: appId,
      adminId,
      note: body.note ? String(body.note).slice(0, 2000) : null,
      reqMeta: extractReqMeta(req), // <-- Fixed: pass only plain metadata
    });
    return ok(res, result);
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * APPROVE
 * ========================================================================== */

export const handleAdminApprove = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { adminId } = await requireAdmin(req);
    const { appId } = req.query;
    const body = parseJsonBody(req);
    const result = await approveApplication({
      applicationId: appId,
      adminId,
      note: body.note ? String(body.note).slice(0, 2000) : null,
      reqMeta: extractReqMeta(req),
    });
    return ok(res, result);
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * REJECT
 * ========================================================================== */

export const handleAdminReject = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { adminId } = await requireAdmin(req);
    const { appId } = req.query;
    const body = parseJsonBody(req);
    const reason = String(body.reason || '').trim();
    if (!reason) {
      throw domainError('REASON_REQUIRED', 'A rejection reason is required.');
    }
    const result = await rejectApplication({
      applicationId: appId,
      adminId,
      reason: reason.slice(0, 2000),
      note: body.note ? String(body.note).slice(0, 2000) : null,
      reqMeta: extractReqMeta(req),
    });
    return ok(res, result);
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * REVOKE
 * ========================================================================== */

export const handleAdminRevoke = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { adminId } = await requireAdmin(req);
    const { appId } = req.query;
    const body = parseJsonBody(req);
    const reason = String(body.reason || '').trim();
    if (!reason) {
      throw domainError('REASON_REQUIRED', 'A revocation reason is required.');
    }
    const result = await revokeApplication({
      applicationId: appId,
      adminId,
      reason: reason.slice(0, 2000),
      reqMeta: extractReqMeta(req),
    });
    return ok(res, result);
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * MARK REFUND COMPLETED
 * ========================================================================== */

export const handleMarkRefunded = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { adminId } = await requireAdmin(req);
    const { appId } = req.query;
    const body = parseJsonBody(req);
    const result = await markRefundCompleted({
      applicationId: appId,
      adminId,
      note: body.note ? String(body.note).slice(0, 2000) : null,
      reqMeta: extractReqMeta(req),
    });
    return ok(res, result);
  } catch (error) {
    return handleError(error, res);
  }
};