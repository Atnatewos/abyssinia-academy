/**
 * @fileoverview GET /api/scholarships/fee-preview
 *
 * Returns the exact registration fee amount for an approved scholarship
 * application, plus the campaign context (including Learn More content).
 * Consumed by the dedicated fee payment page.
 *
 * Auth required. Only the applicant themselves can preview their own
 * application's fee.
 *
 * Query params:
 *   ?applicationId=<uuid>
 *
 * Path: apps/web/pages/api/scholarships/fee-preview.js
 */

import { handleError, domainError } from '../../../lib/scholarships/http/errors';
import { ok, methodNotAllowed } from '../../../lib/scholarships/http/response';
import { requireUser } from '../../../lib/scholarships/http/middleware';
import { query } from '../../../lib/db';

/**
 * GET handler.
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

    const { userId } = await requireUser(req);

    const applicationId = String(req.query.applicationId || '').trim();
    if (!applicationId) {
      throw domainError('VALIDATION_ERROR', 'applicationId is required.');
    }

    const result = await query(
      `SELECT a.id, a.status, a.applicant_user_id, a.payment_due_at,
              c.name AS campaign_name, c.name_am AS campaign_name_am,
              c.slug AS campaign_slug,
              c.registration_fee_etb,
              c.is_active AS campaign_active,
              c.applications_close_at,
              c.learn_more_content, c.learn_more_url
       FROM scholarship_applications a
       JOIN scholarship_campaigns c ON c.id = a.campaign_id
       WHERE a.id = $1`,
      [applicationId]
    );

    const row = result.rows[0];
    if (!row) {
      throw domainError('NOT_FOUND', 'Scholarship application not found.');
    }
    if (row.applicant_user_id !== userId) {
      throw domainError(
        'FORBIDDEN',
        'You can only preview fees for your own applications.'
      );
    }

    const feeAmount = Number(row.registration_fee_etb) || 0;
    const isPendingPayment = row.status === 'pending_payment';
    const isDueExpired = row.payment_due_at
      ? new Date(row.payment_due_at) < new Date()
      : false;

    const canPay = isPendingPayment && feeAmount > 0 && !isDueExpired;

    let blockReason = null;
    if (!isPendingPayment) {
      blockReason = `Application is "${row.status}", not "pending_payment".`;
    } else if (feeAmount <= 0) {
      blockReason = 'This campaign has no registration fee.';
    } else if (isDueExpired) {
      blockReason = 'The payment deadline has passed.';
    } else if (!row.campaign_active) {
      blockReason = 'The campaign is no longer active.';
    }

    return ok(res, {
      applicationId: row.id,
      status: row.status,
      campaign: {
        name: row.campaign_name,
        nameAm: row.campaign_name_am,
        slug: row.campaign_slug,
        learnMoreContent: row.learn_more_content || null,
        learnMoreUrl: row.learn_more_url || null,
      },
      fee: {
        amount: feeAmount,
        currency: 'ETB',
        paymentDueAt: row.payment_due_at,
      },
      canPay,
      blockReason,
    });
  } catch (error) {
    return handleError(error, res);
  }
}