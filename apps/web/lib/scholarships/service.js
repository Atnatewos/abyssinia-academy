/**
 * @fileoverview Scholarship Lifecycle Service
 *
 * The single source of truth for scholarship business logic under the
 * "pay at apply" fee model.
 *
 * Path: apps/web/lib/scholarships/service.js
 */

import { pool, query } from '../db';
import {
  getScholarshipRules,
  getScholarshipAdminConfig,
  getScholarshipDefaults,
} from '../config';
import {
  validateApplicationPayload,
  checkCampaignQuota,
} from './validation';
import {
  createScholarshipEnrollment,
  revokeScholarshipEnrollment,
} from './enrollment';
import {
  notifyApplied,
  notifyPaymentVerified,
  notifyApproved,
  notifyRejected,
  notifyRefundInitiated,
  notifyRefundCompleted,
  notifyRevoked,
  notifyWithdrawn,
} from './notifications';

/* ============================================================================
 * HELPERS
 * ========================================================================== */

const appendEvent = async (client, params) => {
  const {
    applicationId,
    eventType,
    actorUserId = null,
    actorAdminId = null,
    payload = null,
  } = params;
  try {
    await client.query(
      `INSERT INTO scholarship_application_events
         (application_id, event_type, actor_user_id, actor_admin_id, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [applicationId, eventType, actorUserId, actorAdminId, payload]
    );
  } catch (error) {
    console.error('[scholarships/service] audit event insert failed:', {
      applicationId,
      eventType,
      error: error?.message,
    });
  }
};

const isUserBanned = async (client, userId) => {
  const result = await client.query(
    `SELECT banned_at FROM users WHERE id = $1`,
    [userId]
  );
  if (result.rows.length === 0) {
    const error = new Error('User not found.');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return result.rows[0].banned_at !== null && result.rows[0].banned_at !== undefined;
};

/**
 * Validate the applicant-supplied payment proof for a paid campaign.
 * Accepts EITHER a transaction reference OR a screenshot (at least one required).
 */
const validatePaymentPayload = (payment, expectedAmount) => {
  const errors = [];

  if (!payment || typeof payment !== 'object') {
    errors.push('Payment proof is required for paid campaigns.');
    return { valid: false, errors };
  }
  if (!payment.method || typeof payment.method !== 'string') {
    errors.push('Payment method is required.');
  }

  const hasRef = payment.transactionRef && String(payment.transactionRef).trim().length > 0;
  const hasScreenshot = payment.screenshotUrl && String(payment.screenshotUrl).trim().length > 0;

  if (!hasRef && !hasScreenshot) {
    errors.push('Please provide either a transaction reference or a payment screenshot.');
  }

  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('Payment amount is invalid.');
  } else if (Math.abs(amount - expectedAmount) > 1) {
    errors.push(`Payment amount must equal the campaign fee of ${expectedAmount} ETB.`);
  }

  return { valid: errors.length === 0, errors };
};

const insertScholarshipPayment = async (client, params) => {
  const {
    userId,
    applicationId,
    amount,
    method,
    transactionRef,
    screenshotUrl,
  } = params;

  const result = await client.query(
    `INSERT INTO payments (
       user_id, amount, method, status, reference,
       purpose, scholarship_application_id, transaction_id,
       created_at
     )
     VALUES ($1, $2, $3, 'pending', $4, 'scholarship_registration', $5, $6, CURRENT_TIMESTAMP)
     RETURNING id`,
    [userId, amount, method, transactionRef?.trim() || null, applicationId, screenshotUrl || null]
  );
  return { paymentId: result.rows[0].id };
};

const auditAdminAction = async (client, params) => {
  const { adminId, action, targetId, details, reqMeta } = params;
  try {
    await client.query(
      `INSERT INTO admin_audit_logs
         (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, $2, 'scholarship_application', $3, $4, $5, $6)`,
      [
        adminId,
        action,
        targetId,
        JSON.stringify(details || {}),
        reqMeta?.ip || null,
        reqMeta?.userAgent || null,
      ]
    );
  } catch (error) {
    console.error('[scholarships/service] admin audit insert failed:', {
      adminId,
      action,
      error: error?.message,
    });
  }
};

/* ============================================================================
 * APPLY
 * ========================================================================== */

export const applyForScholarship = async (params) => {
  const { userId, campaignSlug, motivation, documents = [], payment = null } = params;

  if (!userId) throw new Error('userId is required.');
  if (!campaignSlug) throw new Error('campaignSlug is required.');

  const payloadResult = validateApplicationPayload({ motivation, documents });
  if (!payloadResult.valid) {
    const error = new Error(payloadResult.errors.join(' '));
    error.code = 'VALIDATION_ERROR';
    error.errors = payloadResult.errors;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const campaignResult = await client.query(
      `SELECT * FROM scholarship_campaigns WHERE slug = $1 FOR UPDATE`,
      [campaignSlug]
    );
    const campaign = campaignResult.rows[0];
    if (!campaign) {
      const error = new Error('Campaign not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }
    if (!campaign.is_active) {
      const error = new Error('This scholarship is not currently accepting applications.');
      error.code = 'CAMPAIGN_INACTIVE';
      throw error;
    }
    const now = new Date();
    if (campaign.applications_close_at && new Date(campaign.applications_close_at) < now) {
      const error = new Error('Applications for this campaign are closed.');
      error.code = 'CAMPAIGN_CLOSED';
      throw error;
    }

    const rules = getScholarshipRules();
    if (rules.bannedUsersCannotApply) {
      const banned = await isUserBanned(client, userId);
      if (banned) {
        const error = new Error('Banned users cannot apply for scholarships.');
        error.code = 'USER_BANNED';
        throw error;
      }
    }

    const feeAmount = Number(campaign.registration_fee_etb) || 0;
    const requiresPayment = feeAmount > 0;

    if (requiresPayment) {
      const paymentResult = validatePaymentPayload(payment, feeAmount);
      if (!paymentResult.valid) {
        const error = new Error(paymentResult.errors.join(' '));
        error.code = 'VALIDATION_ERROR';
        error.errors = paymentResult.errors;
        throw error;
      }
    }

    const initialStatus = 'pending';

    const insertResult = await client.query(
      `INSERT INTO scholarship_applications
         (campaign_id, applicant_user_id, status, motivation, documents)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, status`,
      [campaign.id, userId, initialStatus, motivation.trim(), JSON.stringify(documents)]
    );
    const application = insertResult.rows[0];

    let paymentId = null;
    if (requiresPayment) {
      const { paymentId: newPaymentId } = await insertScholarshipPayment(client, {
        userId,
        applicationId: application.id,
        amount: feeAmount,
        method: payment.method,
        transactionRef: payment.transactionRef,
        screenshotUrl: payment.screenshotUrl,
      });
      paymentId = newPaymentId;
    }

    await appendEvent(client, {
      applicationId: application.id,
      eventType: 'submitted',
      actorUserId: userId,
      payload: {
        campaignSlug: campaign.slug,
        documentCount: documents.length,
        feeAmount: requiresPayment ? feeAmount : 0,
        paymentId,
      },
    });

    await client.query('COMMIT');

    notifyApplied(userId, {
      campaignName: campaign.name,
      applicationId: application.id,
    }).catch(() => {});

    return {
      applicationId: application.id,
      status: application.status,
      paymentId: paymentId || undefined,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error?.code === '23505' && String(error?.constraint || '').includes('scholarship_applications')) {
      const dup = new Error('You have already applied for this scholarship.');
      dup.code = 'ALREADY_APPLIED';
      throw dup;
    }
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * VERIFY PAYMENT
 * ========================================================================== */

export const verifyPayment = async (params) => {
  const { applicationId, adminId, note, reqMeta } = params;

  if (!applicationId) throw new Error('applicationId is required.');
  if (!adminId) throw new Error('adminId is required.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT a.id, a.campaign_id, a.applicant_user_id, a.status,
              c.name AS campaign_name, c.registration_fee_etb
       FROM scholarship_applications a
       JOIN scholarship_campaigns c ON c.id = a.campaign_id
       WHERE a.id = $1
       FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (['payment_verified', 'approved'].includes(application.status)) {
      await client.query('COMMIT');
      return {
        status: application.status,
        paymentStatus: 'approved',
        nextStep: application.status === 'approved' ? 'done' : 'review',
      };
    }

    if (application.status !== 'pending') {
      const error = new Error(
        `Cannot verify payment: application is "${application.status}".`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }

    const fee = Number(application.registration_fee_etb) || 0;
    if (fee <= 0) {
      const error = new Error('This campaign has no registration fee to verify.');
      error.code = 'INVALID_STATE';
      throw error;
    }

    const paymentResult = await client.query(
      `SELECT id, amount, status, method, reference
       FROM payments
       WHERE scholarship_application_id = $1
         AND purpose = 'scholarship_registration'
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [applicationId]
    );
    const payment = paymentResult.rows[0];
    if (!payment) {
      const error = new Error('No payment on file for this application.');
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (payment.status === 'approved') {
      await client.query(
        `UPDATE scholarship_applications SET status = 'payment_verified' WHERE id = $1`,
        [applicationId]
      );
      await client.query('COMMIT');
      return {
        status: 'payment_verified',
        paymentStatus: 'approved',
        nextStep: 'review',
      };
    }

    if (payment.status !== 'pending') {
      const error = new Error(
        `Cannot verify payment in status "${payment.status}".`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }

    await client.query(
      `UPDATE payments
       SET status = 'approved', paid_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [payment.id]
    );

    await client.query(
      `UPDATE scholarship_applications SET status = 'payment_verified' WHERE id = $1`,
      [applicationId]
    );

    await appendEvent(client, {
      applicationId,
      eventType: 'payment_verified',
      actorAdminId: adminId,
      payload: { paymentId: payment.id, amount: Number(payment.amount), note },
    });

    await auditAdminAction(client, {
      adminId,
      action: 'scholarship.payment.verified',
      targetId: applicationId,
      details: {
        paymentId: payment.id,
        amount: Number(payment.amount),
        method: payment.method,
        reference: payment.reference,
      },
      reqMeta,
    });

    await client.query('COMMIT');

    notifyPaymentVerified(application.applicant_user_id, {
      campaignName: application.campaign_name,
      amount: Number(payment.amount),
    }).catch(() => {});

    return {
      status: 'payment_verified',
      paymentStatus: 'approved',
      nextStep: 'review',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * APPROVE APPLICATION
 * ========================================================================== */

export const approveApplication = async (params) => {
  const { applicationId, adminId, note, reqMeta } = params;

  if (!applicationId) throw new Error('applicationId is required.');
  if (!adminId) throw new Error('adminId is required.');

  const adminConfig = getScholarshipAdminConfig();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT * FROM scholarship_applications WHERE id = $1 FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (application.status === 'approved' && application.enrollment_id) {
      await client.query('COMMIT');
      return {
        status: 'approved',
        enrollmentId: application.enrollment_id,
      };
    }

    const campaignResult = await client.query(
      `SELECT * FROM scholarship_campaigns WHERE id = $1 FOR UPDATE`,
      [application.campaign_id]
    );
    const campaign = campaignResult.rows[0];
    if (!campaign) {
      const error = new Error('Campaign not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }

    const fee = Number(campaign.registration_fee_etb) || 0;
    const isPaid = fee > 0;

    if (isPaid) {
      if (application.status !== 'payment_verified') {
        const error = new Error(
          application.status === 'pending'
            ? 'Verify the payment before approving this application.'
            : `Application is "${application.status}", cannot approve.`
        );
        error.code =
          application.status === 'pending' ? 'PAYMENT_NOT_VERIFIED' : 'INVALID_STATE';
        throw error;
      }
    } else if (application.status !== 'pending') {
      const error = new Error(
        `Application is "${application.status}", cannot approve.`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }

    const quotaResult = checkCampaignQuota(
      campaign,
      adminConfig.allowApprovalBeyondQuota
    );
    if (!quotaResult.valid) {
      const error = new Error(quotaResult.errors.join(' '));
      error.code = 'QUOTA_EXCEEDED';
      throw error;
    }

    const rules = getScholarshipRules();
    if (rules.bannedUsersCannotApply) {
      const banned = await isUserBanned(client, application.applicant_user_id);
      if (banned) {
        const error = new Error('Cannot approve: applicant is banned.');
        error.code = 'USER_BANNED';
        throw error;
      }
    }

    let paidAmount = 0;
    if (isPaid) {
      const paymentResult = await client.query(
        `SELECT amount FROM payments
         WHERE scholarship_application_id = $1
           AND purpose = 'scholarship_registration'
           AND status = 'approved'
         LIMIT 1`,
        [applicationId]
      );
      if (paymentResult.rows.length === 0) {
        const error = new Error(
          'Registration fee is not verified. Verify the payment before approving.'
        );
        error.code = 'PAYMENT_NOT_VERIFIED';
        throw error;
      }
      paidAmount = Number(paymentResult.rows[0].amount) || 0;
    }

    const enrollmentResult = await createScholarshipEnrollment(client, {
      userId: application.applicant_user_id,
      applicationId: application.id,
      campaign,
      registrationFeePaid: paidAmount,
    });

    await client.query(
      `UPDATE scholarship_applications
       SET status = 'approved',
           reviewed_by_admin_id = $2,
           reviewed_at = CURRENT_TIMESTAMP,
           admin_notes = COALESCE($3, admin_notes),
           enrollment_id = $4,
           enrollment_created_at = CURRENT_TIMESTAMP,
           refund_status = COALESCE(refund_status, 'not_required')
       WHERE id = $1`,
      [applicationId, adminId, note || null, enrollmentResult.enrollmentId]
    );

    await client.query(
      `UPDATE scholarship_campaigns
       SET approved_count = approved_count + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [campaign.id]
    );

    await appendEvent(client, {
      applicationId,
      eventType: 'approved',
      actorAdminId: adminId,
      payload: { enrollmentId: enrollmentResult.enrollmentId, paidAmount },
    });

    await auditAdminAction(client, {
      adminId,
      action: 'scholarship.application.approved',
      targetId: applicationId,
      details: {
        campaignId: campaign.id,
        enrollmentId: enrollmentResult.enrollmentId,
        paidAmount,
      },
      reqMeta,
    });

    await client.query('COMMIT');

    notifyApproved(application.applicant_user_id, {
      campaignName: campaign.name,
    }).catch(() => {});

    return {
      status: 'approved',
      enrollmentId: enrollmentResult.enrollmentId,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * REJECT APPLICATION
 * ========================================================================== */

export const rejectApplication = async (params) => {
  const { applicationId, adminId, reason, note, reqMeta } = params;
  const adminConfig = getScholarshipAdminConfig();
  const rules = getScholarshipRules();

  if (!applicationId) throw new Error('applicationId is required.');
  if (!adminId) throw new Error('adminId is required.');
  if (adminConfig.requireRejectionReason && !reason) {
    const error = new Error('A rejection reason is required.');
    error.code = 'REASON_REQUIRED';
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT a.id, a.campaign_id, a.applicant_user_id, a.status, a.refund_status,
              c.name AS campaign_name, c.registration_fee_etb
       FROM scholarship_applications a
       JOIN scholarship_campaigns c ON c.id = a.campaign_id
       WHERE a.id = $1
       FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (application.status === 'rejected') {
      await client.query('COMMIT');
      return {
        status: 'rejected',
        refundQueued: application.refund_status === 'pending',
      };
    }

    if (!['pending', 'payment_verified'].includes(application.status)) {
      const error = new Error(
        `Cannot reject application in status ${application.status}.`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }

    const paymentResult = await client.query(
      `SELECT id, amount, status FROM payments
       WHERE scholarship_application_id = $1
         AND purpose = 'scholarship_registration'
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [applicationId]
    );
    const payment = paymentResult.rows[0] || null;
    const fee = Number(application.registration_fee_etb) || 0;
    const refundQueued = fee > 0 && Boolean(payment);
    const refundAmount = refundQueued ? Number(payment.amount) || fee : 0;
    const refundDeadlineDays = rules.refundProcessingDeadlineDays || 3;

    if (refundQueued) {
      await client.query(
        `UPDATE scholarship_applications
         SET status = 'rejected',
             reviewed_by_admin_id = $2,
             reviewed_at = CURRENT_TIMESTAMP,
             rejection_reason = $3,
             admin_notes = COALESCE($4, admin_notes),
             refund_status = 'pending',
             refund_amount_etb = $5,
             refund_requested_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [applicationId, adminId, reason, note || null, refundAmount]
      );
      await client.query(
        `UPDATE payments SET status = 'refund_pending' WHERE id = $1`,
        [payment.id]
      );
    } else {
      await client.query(
        `UPDATE scholarship_applications
         SET status = 'rejected',
             reviewed_by_admin_id = $2,
             reviewed_at = CURRENT_TIMESTAMP,
             rejection_reason = $3,
             admin_notes = COALESCE($4, admin_notes),
             refund_status = 'not_required'
         WHERE id = $1`,
        [applicationId, adminId, reason, note || null]
      );
    }

    await appendEvent(client, {
      applicationId,
      eventType: refundQueued ? 'rejected_with_refund' : 'rejected',
      actorAdminId: adminId,
      payload: { reason, refundQueued, refundAmount },
    });

    await auditAdminAction(client, {
      adminId,
      action: 'scholarship.application.rejected',
      targetId: applicationId,
      details: { reason, refundQueued, refundAmount },
      reqMeta,
    });

    await client.query('COMMIT');

    notifyRejected(application.applicant_user_id, {
      campaignName: application.campaign_name,
      reason,
      amount: refundAmount,
    }).catch(() => {});

    if (refundQueued) {
      notifyRefundInitiated(application.applicant_user_id, {
        campaignName: application.campaign_name,
        amount: refundAmount,
        days: refundDeadlineDays,
      }).catch(() => {});
    }

    return { status: 'rejected', refundQueued };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * REVOKE APPLICATION
 * ========================================================================== */

export const revokeApplication = async (params) => {
  const { applicationId, adminId, reason, reqMeta } = params;
  const adminConfig = getScholarshipAdminConfig();
  const rules = getScholarshipRules();

  if (!adminConfig.allowRevocation) {
    const error = new Error('Revocation is not enabled.');
    error.code = 'REVOKE_DISABLED';
    throw error;
  }
  if (!applicationId) throw new Error('applicationId is required.');
  if (!adminId) throw new Error('adminId is required.');
  if (!reason) {
    const error = new Error('A revocation reason is required.');
    error.code = 'REASON_REQUIRED';
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT a.*, c.name AS campaign_name
       FROM scholarship_applications a
       JOIN scholarship_campaigns c ON c.id = a.campaign_id
       WHERE a.id = $1
       FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }
    if (application.status === 'revoked') {
      await client.query('COMMIT');
      return { status: 'revoked' };
    }
    if (application.status !== 'approved') {
      const error = new Error(
        `Cannot revoke application in status ${application.status}.`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }

    if (application.enrollment_id) {
      await revokeScholarshipEnrollment(client, {
        enrollmentId: application.enrollment_id,
        reason,
        preserveProgress: rules.revokePreservesProgress !== false,
      });
    }

    await client.query(
      `UPDATE scholarship_applications
       SET status = 'revoked',
           revoked_at = CURRENT_TIMESTAMP,
           revoked_by_admin_id = $2,
           revocation_reason = $3
       WHERE id = $1`,
      [applicationId, adminId, reason]
    );

    await client.query(
      `UPDATE scholarship_campaigns
       SET approved_count = GREATEST(approved_count - 1, 0),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [application.campaign_id]
    );

    await appendEvent(client, {
      applicationId,
      eventType: 'revoked',
      actorAdminId: adminId,
      payload: { reason },
    });

    await auditAdminAction(client, {
      adminId,
      action: 'scholarship.application.revoked',
      targetId: applicationId,
      details: { reason },
      reqMeta,
    });

    await client.query('COMMIT');

    notifyRevoked(application.applicant_user_id, {
      campaignName: application.campaign_name,
      reason,
    }).catch(() => {});

    return { status: 'revoked' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * WITHDRAW APPLICATION (user-initiated)
 * ========================================================================== */

export const withdrawApplication = async (params) => {
  const { applicationId, userId } = params;
  const rules = getScholarshipRules();

  if (!applicationId) throw new Error('applicationId is required.');
  if (!userId) throw new Error('userId is required.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT a.*, c.name AS campaign_name
       FROM scholarship_applications a
       JOIN scholarship_campaigns c ON c.id = a.campaign_id
       WHERE a.id = $1
       FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }
    if (application.applicant_user_id !== userId) {
      const error = new Error('You can only withdraw your own application.');
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (application.status === 'withdrawn') {
      await client.query('COMMIT');
      return { status: 'withdrawn' };
    }

    if (!['pending', 'payment_verified'].includes(application.status)) {
      const error = new Error(
        `Cannot withdraw application in status ${application.status}.`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }

    const paymentResult = await client.query(
      `SELECT id, amount FROM payments
       WHERE scholarship_application_id = $1
         AND purpose = 'scholarship_registration'
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [applicationId]
    );
    const payment = paymentResult.rows[0] || null;
    const refundQueued = Boolean(payment);
    const refundAmount = refundQueued ? Number(payment.amount) : 0;
    const refundDeadlineDays = rules.refundProcessingDeadlineDays || 3;

    if (refundQueued) {
      await client.query(
        `UPDATE scholarship_applications
         SET status = 'withdrawn',
             refund_status = 'pending',
             refund_amount_etb = $2,
             refund_requested_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [applicationId, refundAmount]
      );
      await client.query(
        `UPDATE payments SET status = 'refund_pending' WHERE id = $1`,
        [payment.id]
      );
    } else {
      await client.query(
        `UPDATE scholarship_applications
         SET status = 'withdrawn',
             refund_status = 'not_required'
         WHERE id = $1`,
        [applicationId]
      );
    }

    await appendEvent(client, {
      applicationId,
      eventType: 'withdrawn',
      actorUserId: userId,
      payload: { refundQueued, refundAmount },
    });

    await client.query('COMMIT');

    notifyWithdrawn(userId, {
      campaignName: application.campaign_name,
      amount: refundAmount,
    }).catch(() => {});

    if (refundQueued) {
      notifyRefundInitiated(userId, {
        campaignName: application.campaign_name,
        amount: refundAmount,
        days: refundDeadlineDays,
      }).catch(() => {});
    }

    return { status: 'withdrawn' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * MARK REFUND COMPLETED (admin)
 * ========================================================================== */

export const markRefundCompleted = async (params) => {
  const { applicationId, adminId, note, reqMeta } = params;

  if (!applicationId) throw new Error('applicationId is required.');
  if (!adminId) throw new Error('adminId is required.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT id, applicant_user_id, campaign_id, refund_status, refund_amount_etb
       FROM scholarship_applications WHERE id = $1 FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }
    if (application.refund_status === 'completed') {
      await client.query('COMMIT');
      return { refundStatus: 'completed' };
    }
    if (application.refund_status !== 'pending') {
      const error = new Error(`Refund is "${application.refund_status}".`);
      error.code = 'REFUND_NOT_PENDING';
      throw error;
    }

    await client.query(
      `UPDATE scholarship_applications
       SET refund_status = 'completed',
           refund_processed_at = CURRENT_TIMESTAMP,
           refund_processed_by = $2,
           refund_note = COALESCE($3, refund_note)
       WHERE id = $1`,
      [applicationId, adminId, note ? String(note).slice(0, 2000) : null]
    );

    await client.query(
      `UPDATE payments SET status = 'refunded'
       WHERE scholarship_application_id = $1 AND status = 'refund_pending'`,
      [applicationId]
    );

    await appendEvent(client, {
      applicationId,
      eventType: 'refund_completed',
      actorAdminId: adminId,
      payload: {
        amount: Number(application.refund_amount_etb) || 0,
        note: note || null,
      },
    });

    await auditAdminAction(client, {
      adminId,
      action: 'scholarship.refund.completed',
      targetId: applicationId,
      details: {
        amount: Number(application.refund_amount_etb) || 0,
        note: note || null,
      },
      reqMeta,
    });

    const campaignResult = await client.query(
      `SELECT name FROM scholarship_campaigns WHERE id = $1`,
      [application.campaign_id]
    );
    const campaignName = campaignResult.rows[0]?.name || 'the campaign';

    await client.query('COMMIT');

    notifyRefundCompleted(application.applicant_user_id, {
      campaignName,
      amount: Number(application.refund_amount_etb) || 0,
    }).catch(() => {});

    return { refundStatus: 'completed' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * READ HELPERS
 * ========================================================================== */

export const listActiveCampaigns = async ({ limit = 20 } = {}) => {
  const defaults = getScholarshipDefaults();
  const graceSeconds = Number(defaults.openingGraceSeconds) || 60;

  const result = await query(
    `SELECT id, slug, name, name_am, description, description_am,
            grants_full_course, grants_phases,
            registration_fee_etb, quota, approved_count,
            applications_open_at, applications_close_at,
            cover_image_url, required_documents,
            learn_more_content, learn_more_url,
            created_at
     FROM scholarship_campaigns
     WHERE is_active = true
       AND applications_open_at <= (CURRENT_TIMESTAMP + ($1 || ' seconds')::interval)
       AND (applications_close_at IS NULL OR applications_close_at > CURRENT_TIMESTAMP)
     ORDER BY created_at DESC
     LIMIT $2`,
    [String(graceSeconds), limit]
  );

  return result.rows;
};

export const getCampaignBySlug = async (slug) => {
  const result = await query(
    `SELECT * FROM scholarship_campaigns WHERE slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
};

export const listUserApplications = async (userId) => {
  const result = await query(
    `SELECT a.*, c.name AS campaign_name, c.slug AS campaign_slug,
            c.grants_full_course, c.grants_phases, c.registration_fee_etb
     FROM scholarship_applications a
     JOIN scholarship_campaigns c ON c.id = a.campaign_id
     WHERE a.applicant_user_id = $1
     ORDER BY a.created_at DESC`,
    [userId]
  );
  return result.rows;
};


/* ============================================================================
 * DELETE CAMPAIGN (SOFT/HARD DELETE)
 * ========================================================================== */

/**
 * Deletes a campaign. If it has applications, it performs a soft delete
 * (archives it) to protect the applicant and payment data. If it has 
 * zero applications, it hard deletes the row.
 *
 * @param {object} params
 * @param {string} params.campaignId
 * @param {string} params.adminId
 * @param {object} [params.reqMeta]
 * @returns {Promise<{ success: boolean, type: 'hard'|'soft' }>}
 */
export const deleteCampaign = async (params) => {
  const { campaignId, adminId, reqMeta } = params;

  if (!campaignId) throw new Error('campaignId is required.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const campaignResult = await client.query(
      `SELECT id, name FROM scholarship_campaigns WHERE id = $1 FOR UPDATE`,
      [campaignId]
    );
    const campaign = campaignResult.rows[0];
    if (!campaign) {
      const error = new Error('Campaign not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }

    const appCountResult = await client.query(
      `SELECT COUNT(*)::int AS count FROM scholarship_applications WHERE campaign_id = $1`,
      [campaignId]
    );
    const appCount = appCountResult.rows[0].count;

    let deleteType = 'hard';

    if (appCount > 0) {
      /* Soft Delete: Preserve applicant data and payment records */
      await client.query(
        `UPDATE scholarship_campaigns
         SET is_deleted = true, is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [campaignId]
      );
      deleteType = 'soft';
    } else {
      /* Hard Delete: No applicants, safe to destroy */
      await client.query(
        `DELETE FROM scholarship_campaigns WHERE id = $1`,
        [campaignId]
      );
    }

    await auditAdminAction(client, {
      adminId,
      action: `scholarship.campaign.${deleteType}_deleted`,
      targetId: campaignId,
      details: { campaignName: campaign.name, appCount },
      reqMeta,
    });

    await client.query('COMMIT');
    return { success: true, type: deleteType };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};