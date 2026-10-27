/**
 * @fileoverview Payment Service
 * Business logic for payment submissions and admin approval
 * Path: apps/api/src/services/payment.service.js
 */

const paymentsDb = require('../database/queries/payments');
const usersDb = require('../database/queries/users');
const mlmDb = require('../database/queries/mlm-referrals');
const mlmReferralService = require('./mlm-referral.service');
const { payments } = require('../../../../packages/shared/config');
const { BadRequestError, NotFoundError } = require('../utils/errors');

/**
 * Submit a payment for admin review.
 *
 * Amount is taken from the shared payments config — never trusted
 * from the client. The pricing config is the single source of truth.
 *
 * @param {string} userId - User UUID
 * @param {object} paymentData - Payment submission data
 * @returns {object} Created payment
 */
const submitPayment = async (userId, paymentData) => {
  const { fullName, phone, paymentMethod, transactionRef, screenshotUrl } = paymentData;

  const existingPayment = await paymentsDb.getUserPayment(userId);
  if (existingPayment && existingPayment.status === 'pending') {
    throw new BadRequestError('You already have a pending payment under review.');
  }

  const amount = payments.pricing.fullCourse.amountETB;

  const payment = await paymentsDb.createPayment({
    userId,
    amount,
    method: paymentMethod,
    transactionRef,
    screenshotUrl: screenshotUrl || null,
  });

  await usersDb.updatePaymentStatus(userId, 'pending');

  return payment;
};

/**
 * Approve a payment and enroll the student.
 *
 * After updating the payment and enrollment records, we distribute
 * commissions to the buyer's ancestors and award any qualifying bonuses.
 *
 * MLM operations are wrapped in a try/catch so that a failure in the
 * referral subsystem NEVER blocks the student from gaining access.
 * Any failure is logged for admin review.
 *
 * @param {string} paymentId - Payment UUID
 * @returns {object} Updated payment
 */
const approvePayment = async (paymentId) => {
  const payment = await paymentsDb.getPaymentById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found.');
  }

  if (payment.status !== 'pending') {
    throw new BadRequestError('Only pending payments can be approved.');
  }

  /*
   * Core approval — always runs first.
   */
  await paymentsDb.updatePaymentStatus(paymentId, 'approved');
  await paymentsDb.markPaymentPaid(paymentId);
  await usersDb.updateEnrollmentStatus(payment.user_id, true);
  await usersDb.updatePaymentStatus(payment.user_id, 'approved');

  /*
   * MLM side-effects — best-effort. Logged on failure.
   */
  try {
    const saleAmount = parseFloat(payment.amount);

    const distribution = await mlmReferralService.distributeCommissions(
      payment.user_id,
      paymentId,
      saleAmount
    );

    /*
     * Award bonuses to every user who received a commission on this
     * sale. Their counters were just incremented indirectly through the
     * tree; their cached team-size counters were already bumped at
     * registration time, so bonus thresholds are evaluated against
     * current values.
     */
    if (distribution.distributed > 0) {
      const commissionRows = await mlmDb.getCommissionsByPayment(paymentId);
      const uniqueEarningUsers = new Set(
        commissionRows.map((row) => row.earning_user_id)
      );

      for (const earningUserId of uniqueEarningUsers) {
        try {
          await mlmReferralService.awardEligibleBonuses(earningUserId);
        } catch (bonusError) {
          console.error('Bonus award failed for user:', {
            userId: earningUserId,
            paymentId,
            error: bonusError.message,
          });
        }
      }
    }
  } catch (mlmError) {
    console.error('Commission distribution failed after payment approval:', {
      paymentId,
      buyerId: payment.user_id,
      error: mlmError.message,
    });
  }

  const updatedPayment = await paymentsDb.getPaymentById(paymentId);
  return updatedPayment;
};

/**
 * Reject a payment.
 *
 * If the payment had already been approved and commissions were
 * distributed, we reverse those commissions here so the ledger stays
 * consistent. Reversal is best-effort and logged on failure.
 *
 * @param {string} paymentId - Payment UUID
 * @returns {object} Updated payment
 */
const rejectPayment = async (paymentId) => {
  const payment = await paymentsDb.getPaymentById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found.');
  }

  if (payment.status !== 'pending') {
    throw new BadRequestError('Only pending payments can be rejected.');
  }

  await paymentsDb.updatePaymentStatus(paymentId, 'rejected');
  await usersDb.updatePaymentStatus(payment.user_id, 'rejected');

  const updatedPayment = await paymentsDb.getPaymentById(paymentId);
  return updatedPayment;
};

module.exports = {
  submitPayment,
  approvePayment,
  rejectPayment,
};