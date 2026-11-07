/**
 * @fileoverview Scholarship Lifecycle Service
 *
 * The single source of truth for scholarship business logic. Every
 * state transition runs inside a transaction with proper row locks.
 *
 * Payment handling:
 *   When a campaign has `registration_fee_etb > 0`, the applicant is
 *   expected to submit a `payment` payload alongside their application.
 *   `applyForScholarship` inserts a `payments` row with
 *   `purpose='scholarship_registration'` inside the same transaction as
 *   the application itself. This guarantees atomicity — either both rows
 *   land, or neither does.
 *
 *   The application transitions directly to `pending_payment` for paid
 *   campaigns so the admin's review queue correctly reflects "waiting on
 *   money" state. Free campaigns skip the payment step entirely and go
 *   straight to `pending`.
 *
 * Ban semantics:
 *   A ban is modeled as `users.banned_at IS NOT NULL`. There is no
 *   boolean `is_banned` column. Every ban check derives the boolean
 *   from the timestamp field.
 *
 * Path: apps/web/lib/scholarships/service.js
 */

/**
 * @fileoverview Scholarship Lifecycle Service
 *
 * Two-step approval for paid campaigns:
 *   1. verifyPayment()  — admin confirms money arrived (pending_payment → pending)
 *   2. approveApplication() — admin grants the scholarship (pending → approved)
 *
 * Free campaigns skip step 1 (they start at 'pending').
 *
 * Path: apps/web/lib/scholarships/service.js
 */

import { pool, query } from '../db';
import {
  getScholarshipRules,
  getScholarshipAdminConfig,
  getScholarshipRegistrationFeeConfig,
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
  notifyApproved,
  notifyFeeDue,
  notifyFeePaid,
  notifyRejected,
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

const validatePaymentPayload = (payment, expectedAmount) => {
  const errors = [];
  if (!payment || typeof payment !== 'object') {
    errors.push('Payment details are required for paid campaigns.');
    return { valid: false, errors };
  }
  if (!payment.method || typeof payment.method !== 'string') {
    errors.push('Payment method is required.');
  }
  if (!payment.transactionRef || typeof payment.transactionRef !== 'string' || !payment.transactionRef.trim()) {
    errors.push('Transaction reference is required.');
  }
  if (!payment.screenshotUrl || typeof payment.screenshotUrl !== 'string') {
    errors.push('Payment screenshot is required.');
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
    [userId, amount, method, transactionRef.trim(), applicationId, screenshotUrl]
  );
  return { paymentId: result.rows[0].id };
};

/* ============================================================================
 * APPLY
 * ========================================================================== */

export const applyForScholarship = async (params) => {
  const {
    userId,
    campaignSlug,
    motivation,
    documents = [],
    payment = null,
  } = params;

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

    const initialStatus = requiresPayment ? 'pending_payment' : 'pending';

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

/**
 * Admin confirms the payment arrived. Transitions:
 *   payments.status: pending → approved
 *   application.status: pending_payment → pending
 *
 * After this, the application is ready for review (approve / reject).
 *
 * Idempotent — if already verified (payment approved + app pending or
 * approved), returns without error.
 *
 * @param {object} params
 * @param {string} params.applicationId
 * @param {string} params.adminId
 * @param {string} [params.note]
 * @returns {Promise<{ status: string, paymentStatus: string, nextStep: string }>}
 */
export const verifyPayment = async (params) => {
  const { applicationId, adminId, note } = params;

  if (!applicationId) throw new Error('applicationId is required.');
  if (!adminId) throw new Error('adminId is required.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT id, campaign_id, applicant_user_id, status
       FROM scholarship_applications
       WHERE id = $1 FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }

    /* Idempotent: if app is already past pending_payment, no-op. */
    if (application.status === 'pending' || application.status === 'approved') {
      await client.query('COMMIT');
      return {
        status: application.status,
        paymentStatus: 'approved',
        nextStep: application.status === 'approved' ? 'done' : 'review',
      };
    }

    if (application.status !== 'pending_payment') {
      const error = new Error(
        `Cannot verify payment: application is "${application.status}".`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }

    const paymentResult = await client.query(
      `SELECT id, amount, status
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
      const error = new Error(
        'No payment on file for this application. Applicant has not submitted proof.'
      );
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (payment.status === 'approved') {
      /* Payment already verified but app still pending_payment — fix status. */
      await client.query(
        `UPDATE scholarship_applications SET status = 'pending' WHERE id = $1`,
        [applicationId]
      );
      await client.query('COMMIT');
      return {
        status: 'pending',
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
      `UPDATE scholarship_applications SET status = 'pending' WHERE id = $1`,
      [applicationId]
    );

    await appendEvent(client, {
      applicationId,
      eventType: 'payment_verified',
      actorAdminId: adminId,
      payload: { paymentId: payment.id, amount: Number(payment.amount), note },
    });

    const campaignResult = await client.query(
      `SELECT name FROM scholarship_campaigns WHERE id = $1`,
      [application.campaign_id]
    );
    const campaignName = campaignResult.rows[0]?.name || 'the campaign';

    await client.query('COMMIT');

    try {
      const { notify } = await import('../notifications');
      notify(
        application.applicant_user_id,
        'scholarship_payment_verified',
        { campaign: campaignName, amount: Number(payment.amount) },
        '/profile/scholarships'
      ).catch(() => {});
    } catch (err) {
      console.error('[verify-payment] notification failed:', err?.message);
    }

    return {
      status: 'pending',
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

/**
 * Grant the scholarship. Requires status='pending' — the payment (if any)
 * must have been verified via verifyPayment() first.
 *
 * @param {object} params
 * @param {string} params.applicationId
 * @param {string} params.adminId
 * @param {string} [params.note]
 * @returns {Promise<{ status: 'approved', enrollmentId: string }>}
 */
export const approveApplication = async (params) => {
  const { applicationId, adminId, note } = params;

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
    if (application.status !== 'pending') {
      const error = new Error(
        `Application is "${application.status}", cannot approve. ` +
        `For paid campaigns, verify the payment first.`
      );
      error.code = 'INVALID_STATE';
      throw error;
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

    /* Look up the approved payment amount so the enrollment row records
       what was actually paid. */
    const paymentResult = await client.query(
      `SELECT amount FROM payments
       WHERE scholarship_application_id = $1
         AND purpose = 'scholarship_registration'
         AND status = 'approved'
       LIMIT 1`,
      [applicationId]
    );
    const paidAmount = paymentResult.rows[0]
      ? Number(paymentResult.rows[0].amount) || 0
      : 0;

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
           enrollment_created_at = CURRENT_TIMESTAMP
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
 * RECORD FEE PAID / REJECT / REVOKE / WITHDRAW (unchanged)
 * ==========================================================================
 * Full implementations shipped in the previous batch.
 * If you need those files re-pasted, say so — but they don't change.
 * ========================================================================== */

// [recordFeePaid, rejectApplication, revokeApplication, withdrawApplication,
//  listActiveCampaigns, getCampaignBySlug, listUserApplications — unchanged]

export const recordFeePaid = async (params) => {
  const { applicationId, paymentId, adminId, amountPaid } = params;
  if (!applicationId) throw new Error('applicationId is required.');
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
      return { enrollmentId: application.enrollment_id };
    }
    if (application.status !== 'pending_payment') {
      const error = new Error(
        `Cannot record fee payment for application in status ${application.status}.`
      );
      error.code = 'INVALID_STATE';
      throw error;
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
    const enrollmentResult = await createScholarshipEnrollment(client, {
      userId: application.applicant_user_id,
      applicationId: application.id,
      campaign,
      registrationFeePaid: Number(amountPaid) || 0,
    });
    await client.query(
      `UPDATE scholarship_applications
       SET status = 'approved',
           enrollment_id = $2,
           enrollment_created_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [applicationId, enrollmentResult.enrollmentId]
    );
    await client.query(
      `UPDATE scholarship_campaigns
       SET approved_count = approved_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [campaign.id]
    );
    await appendEvent(client, {
      applicationId,
      eventType: 'payment_received',
      actorAdminId: adminId || null,
      payload: { paymentId, amountPaid },
    });
    await client.query('COMMIT');
    notifyFeePaid(application.applicant_user_id, { campaignName: campaign.name }).catch(() => {});
    return { enrollmentId: enrollmentResult.enrollmentId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const rejectApplication = async (params) => {
  const { applicationId, adminId, reason, note } = params;
  const adminConfig = getScholarshipAdminConfig();
  const scholarshipDefaults = getScholarshipDefaults();

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
      `SELECT id, campaign_id, applicant_user_id, status, refund_status
       FROM scholarship_applications WHERE id = $1 FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
    }
    if (!['pending', 'pending_payment'].includes(application.status)) {
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
         AND status IN ('pending', 'approved')
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [applicationId]
    );
    const payment = paymentResult.rows[0] || null;
    const refundAmount = payment ? Number(payment.amount) : 0;
    const refundQueued = refundAmount > 0;

    if (refundQueued && payment.status === 'approved') {
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

    const campaignResult = await client.query(
      `SELECT name FROM scholarship_campaigns WHERE id = $1`,
      [application.campaign_id]
    );
    const campaignName = campaignResult.rows[0]?.name || 'the campaign';

    await client.query('COMMIT');
    notifyRejected(application.applicant_user_id, { campaignName, reason }).catch(() => {});

    if (refundQueued) {
      try {
        const { notify } = await import('../notifications');
        const deadlineDays = scholarshipDefaults.refundProcessingDeadlineDays || 3;
        notify(
          application.applicant_user_id,
          'scholarship_refund_initiated',
          { campaign: campaignName, amount: refundAmount, days: deadlineDays },
          '/profile/scholarships'
        ).catch(() => {});
      } catch (err) {
        console.error('[reject] refund notification failed:', err?.message);
      }
    }

    return { status: 'rejected', refundQueued };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const revokeApplication = async (params) => {
  const { applicationId, adminId, reason } = params;
  const adminConfig = getScholarshipAdminConfig();
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
      `SELECT * FROM scholarship_applications WHERE id = $1 FOR UPDATE`,
      [applicationId]
    );
    const application = appResult.rows[0];
    if (!application) {
      const error = new Error('Application not found.');
      error.code = 'NOT_FOUND';
      throw error;
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
    const campaignResult = await client.query(
      `SELECT name FROM scholarship_campaigns WHERE id = $1`,
      [application.campaign_id]
    );
    const campaignName = campaignResult.rows[0]?.name || 'the campaign';
    await client.query('COMMIT');
    notifyRevoked(application.applicant_user_id, { campaignName, reason }).catch(() => {});
    return { status: 'revoked' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const withdrawApplication = async (params) => {
  const { applicationId, userId } = params;
  if (!applicationId) throw new Error('applicationId is required.');
  if (!userId) throw new Error('userId is required.');
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
    if (application.applicant_user_id !== userId) {
      const error = new Error('You can only withdraw your own application.');
      error.code = 'FORBIDDEN';
      throw error;
    }
    if (!['pending', 'pending_payment'].includes(application.status)) {
      const error = new Error(
        `Cannot withdraw application in status ${application.status}.`
      );
      error.code = 'INVALID_STATE';
      throw error;
    }
    await client.query(
      `UPDATE scholarship_applications SET status = 'withdrawn' WHERE id = $1`,
      [applicationId]
    );
    await appendEvent(client, {
      applicationId,
      eventType: 'withdrawn',
      actorUserId: userId,
    });
    const campaignResult = await client.query(
      `SELECT name FROM scholarship_campaigns WHERE id = $1`,
      [application.campaign_id]
    );
    const campaignName = campaignResult.rows[0]?.name || 'the campaign';
    await client.query('COMMIT');
    notifyWithdrawn(userId, { campaignName }).catch(() => {});
    return { status: 'withdrawn' };
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