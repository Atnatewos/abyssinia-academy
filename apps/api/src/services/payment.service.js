/**
 * @fileoverview Payment Service
 * Business logic for payment submissions and admin approval
 * Path: apps/api/src/services/payment.service.js
 */

const paymentsDb = require('../database/queries/payments');
const usersDb = require('../database/queries/users');
const { payments } = require('../../../../packages/shared/config');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const submitPayment = async (userId, paymentData) => {
  const { fullName, phone, paymentMethod, transactionRef, screenshotUrl } = paymentData;

  const existingPayment = await paymentsDb.getUserPayment(userId);
  if (existingPayment && existingPayment.status === 'pending') {
    throw new BadRequestError('You already have a pending payment under review.');
  }

  const payment = await paymentsDb.createPayment({
    userId,
    amount: payments.pricing.amountETB,
    method: paymentMethod,
    transactionRef,
    screenshotUrl: screenshotUrl || null,
  });

  await usersDb.updatePaymentStatus(userId, 'pending');

  return payment;
};

const approvePayment = async (paymentId) => {
  const payment = await paymentsDb.getPaymentById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found.');
  }

  if (payment.status !== 'pending') {
    throw new BadRequestError('Only pending payments can be approved.');
  }

  await paymentsDb.updatePaymentStatus(paymentId, 'approved');
  await paymentsDb.markPaymentPaid(paymentId);

  await usersDb.updateEnrollmentStatus(payment.user_id, true);
  await usersDb.updatePaymentStatus(payment.user_id, 'approved');

  const updatedPayment = await paymentsDb.getPaymentById(paymentId);
  return updatedPayment;
};

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