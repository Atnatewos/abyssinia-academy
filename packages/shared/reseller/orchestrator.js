/**
 * @fileoverview Reseller Payment Orchestrator
 *
 * The single entry point for processing an approved payment. Routes the
 * payment to the correct mode (scholarship, reseller, MLM, direct) and
 * executes the appropriate distribution logic within a single atomic
 * transaction.
 *
 * Why an orchestrator?
 *   - One place to decide WHICH mode fires — no double-paying
 *   - One place to add new modes in the future
 *   - Consistent error handling across all approval paths
 *   - Audit trail: every sale logs which route was taken
 *
 * The orchestrator is intentionally DB-agnostic. Consumers pass in a
 * `db` adapter: { query(text, params), getClient() }.
 *
 * Path: packages/shared/reseller/orchestrator.js
 */

const { loadResellerConfig } = require('./config-loader');
const { computeSplit, recordSale } = require('./commissions');
const {
  findByUserId,
  findByCode,
  getParentProfile,
  ensureResellerProfile,
} = require('./profile-helpers');
const {
  checkSelfPurchase,
  checkTeamPurchase,
  checkSameIp,
  checkSamePhone,
} = require('./anti-fraud');
const { checkCaps } = require('./caps');
const {
  ResellerValidationError,
  ResellerForbiddenError,
  ResellerNotFoundError,
  ResellerLimitError,
} = require('./errors');

/**
 * Fetch the payment record with locked row inside a transaction.
 *
 * @param {object} client - Transaction client
 * @param {string} paymentId
 * @returns {Promise<object>} Payment row
 */
const lockPayment = async (client, paymentId) => {
  const result = await client.query(
    `SELECT id, user_id, amount, status, reseller_user_id, parent_reseller_user_id
     FROM payments
     WHERE id = $1
     FOR UPDATE`,
    [paymentId]
  );
  if (result.rows.length === 0) {
    throw new ResellerNotFoundError('Payment not found.', 'PAYMENT_NOT_FOUND');
  }
  return result.rows[0];
};

/**
 * Determine the commission route for a payment.
 *
 * Priority (highest wins):
 *   1. Scholarship fee (purpose='scholarship_registration') → no commission
 *   2. Reseller (reseller_user_id is set) → reseller split
 *   3. Direct → no commission
 *
 * Note: MLM and legacy-agent routes are detected and delegated by the
 * caller (payment.service.js) BEFORE calling this orchestrator. This
 * module is responsible only for the reseller route.
 *
 * @param {object} payment
 * @returns {'reseller'|'direct'}
 */
const determineRoute = (payment) => {
  if (payment.reseller_user_id) return 'reseller';
  return 'direct';
};

/**
 * Process a payment through the reseller flow.
 *
 * MUST be called inside an existing transaction (caller owns BEGIN/COMMIT).
 *
 * Steps:
 *   1. Lock payment row
 *   2. Load reseller + parent profiles
 *   3. Run anti-fraud checks (self/team/IP/phone)
 *   4. Check payout caps
 *   5. Compute split from price + config
 *   6. Record sale (writes reseller_sales + credits wallets + logs events)
 *
 * @param {object} client - Transaction client
 * @param {object} params
 * @param {string} params.paymentId
 * @param {string} [params.buyerIp]
 * @param {string} [params.buyerPhone]
 * @param {string} [params.resellerLastIp]
 * @returns {Promise<object>} Result with route + sale details
 */
const processResellerPayment = async (client, params) => {
  const { paymentId, buyerIp, buyerPhone, resellerLastIp } = params;

  /* ── 1. Lock payment ──────────────────────────────────────────────────── */
  const payment = await lockPayment(client, paymentId);

  if (payment.status !== 'approved') {
    throw new ResellerValidationError(
      `Payment status must be 'approved' before distribution. Got '${payment.status}'.`,
      'PAYMENT_NOT_APPROVED'
    );
  }

  /* ── 2. Idempotency check ─────────────────────────────────────────────── */
  const existing = await client.query(
    'SELECT id FROM reseller_sales WHERE payment_id = $1 LIMIT 1',
    [paymentId]
  );
  if (existing.rows.length > 0) {
    return {
      route: 'reseller',
      alreadyProcessed: true,
      saleId: existing.rows[0].id,
    };
  }

  /* ── 3. Load reseller profile ────────────────────────────────────────── */
  const resellerProfile = await findByUserId(client, payment.reseller_user_id);
  if (!resellerProfile) {
    throw new ResellerNotFoundError(
      'Reseller profile not found for payment.',
      'RESELLER_PROFILE_NOT_FOUND'
    );
  }

  if (resellerProfile.status !== 'active') {
    throw new ResellerForbiddenError(
      `Reseller is not active (status: ${resellerProfile.status}).`,
      'RESELLER_NOT_ACTIVE'
    );
  }

  /* ── 4. Load parent profile (if any) ─────────────────────────────────── */
  const parentProfile = resellerProfile.parent_reseller_id
    ? await getParentProfile(client, resellerProfile.id)
    : null;

  /* ── 5. Load config ──────────────────────────────────────────────────── */
  const config = await loadResellerConfig({ db: client, resellerId: resellerProfile.id });

  /* ── 6. Anti-fraud checks ────────────────────────────────────────────── */
  checkSelfPurchase(payment.user_id, resellerProfile.user_id, config);
  checkTeamPurchase(payment.user_id, resellerProfile, parentProfile, config);
  checkSameIp(buyerIp, resellerLastIp, config);
  checkSamePhone(buyerPhone, null, config);

  /* ── 7. Compute split ────────────────────────────────────────────────── */
  const retailPrice = parseFloat(payment.amount);
  const split = computeSplit({
    retailPrice,
    platformFeePercent: config.commission.platformFeePercent,
    subSharePercent: parseFloat(resellerProfile.sub_share_percent),
    hasParent: Boolean(parentProfile),
  });

  /* ── 8. Cap check ────────────────────────────────────────────────────── */
  const capsCheck = await checkCaps(client, {
    userId: resellerProfile.user_id,
    payoutAmount: split.subResellerPayout,
    config,
  });
  if (!capsCheck.allowed) {
    throw new ResellerLimitError(
      `Payout cap reached: ${capsCheck.reason}`,
      capsCheck.reason === 'user_cap_reached' ? 'USER_CAP_REACHED' : 'PLATFORM_CAP_REACHED'
    );
  }

  if (parentProfile && split.parentResellerPayout > 0) {
    const parentCapsCheck = await checkCaps(client, {
      userId: parentProfile.user_id,
      payoutAmount: split.parentResellerPayout,
      config,
    });
    if (!parentCapsCheck.allowed) {
      /* Parent cap hit — pay parent 0, keep funds with platform.
         Log for admin review; do not fail the whole sale. */
      split.parentResellerPayout = 0;
    }
  }

  /* ── 9. Record sale + credit wallets ─────────────────────────────────── */
  const sale = await recordSale(client, {
    resellerProfileId: resellerProfile.id,
    resellerUserId: resellerProfile.user_id,
    buyerUserId: payment.user_id,
    paymentId,
    split,
    parentProfileId: parentProfile ? parentProfile.id : null,
    parentUserId: parentProfile ? parentProfile.user_id : null,
    lockDays: config.payout.lockDays,
  });

  /* ── 10. Update reseller activity ────────────────────────────────────── */
  await client.query(
    'UPDATE reseller_profiles SET last_sale_at = NOW(), updated_at = NOW() WHERE id = $1',
    [resellerProfile.id]
  );

  return {
    route: 'reseller',
    saleId: sale.id,
    split: {
      retailPrice: split.retailPrice,
      platformFee: split.platformFeeAmount,
      resellerPool: split.resellerPool,
      subPayout: split.subResellerPayout,
      parentPayout: split.parentResellerPayout,
      subSharePercent: split.subSharePercent,
    },
    lockDays: config.payout.lockDays,
  };
};

/**
 * Main orchestrator entry point.
 *
 * Handles the WHOLE payment lifecycle for reseller-related payments:
 *   - Locks the payment
 *   - Determines route
 *   - Executes the appropriate distribution
 *   - Returns a structured result
 *
 * For payments with `reseller_user_id`, processes the reseller split.
 * For direct payments, returns a "no commission" result.
 *
 * @param {object} db - { query, getClient }
 * @param {object} params
 * @param {string} params.paymentId
 * @param {string} [params.buyerIp]
 * @param {string} [params.buyerPhone]
 * @returns {Promise<object>} Distribution result
 */
const processApprovedPayment = async (db, params) => {
  const { paymentId } = params;
  if (!paymentId) {
    throw new ResellerValidationError('paymentId is required.', 'MISSING_PAYMENT_ID');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    /* Re-read payment to determine route */
    const routeCheck = await client.query(
      'SELECT id, status, reseller_user_id FROM payments WHERE id = $1',
      [paymentId]
    );
    if (routeCheck.rows.length === 0) {
      throw new ResellerNotFoundError('Payment not found.', 'PAYMENT_NOT_FOUND');
    }
    const route = determineRoute(routeCheck.rows[0]);

    let result;
    if (route === 'reseller') {
      result = await processResellerPayment(client, params);
    } else {
      result = { route: 'direct', commission: 0 };
    }

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  processApprovedPayment,
  processResellerPayment,
  determineRoute,
  lockPayment,
};