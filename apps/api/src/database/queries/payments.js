// /**
//  * @fileoverview Payment Database Queries
//  *
//  * All payment submission and approval queries. Every query is parameterized.
//  *
//  * Reseller attribution (from migration 028) and course attribution (from
//  * Wave 7) are both optional — a payment row can be attributed to a reseller,
//  * a specific course, or neither, depending on how the buyer arrived.
//  *
//  * Path: apps/api/src/database/queries/payments.js
//  */

// const { query } = require('../pool');

// /**
//  * Create a new pending payment.
//  *
//  * Supports standard course purchases, reseller-attributed payments, and
//  * course-specific purchases (via courseId). All attribution fields are
//  * optional; omitted columns default to NULL.
//  *
//  * @param {object} params
//  * @param {string} params.userId
//  * @param {number} params.amount
//  * @param {string} params.method
//  * @param {string} params.transactionRef
//  * @param {string|null} [params.screenshotUrl]
//  * @param {string|null} [params.courseId] - Optional course UUID
//  * @param {string|null} [params.resellerUserId]
//  * @param {string|null} [params.parentResellerUserId]
//  * @param {number|null} [params.resellerRetailPrice]
//  * @param {number|null} [params.platformFeeAmount]
//  * @param {string} [params.purchaseMode='full-course']
//  * @param {string[]|null} [params.selectedPhases]
//  * @param {string} [params.purpose='course']
//  * @param {string|null} [params.scholarshipApplicationId]
//  * @returns {Promise<object>} Created payment row
//  */
// const createPayment = async ({
//   userId,
//   amount,
//   method,
//   transactionRef,
//   screenshotUrl = null,
//   courseId = null,
//   resellerUserId = null,
//   parentResellerUserId = null,
//   resellerRetailPrice = null,
//   platformFeeAmount = null,
//   purchaseMode = 'full-course',
//   selectedPhases = null,
//   purpose = 'course',
//   scholarshipApplicationId = null,
// }) => {
//   const result = await query(
//     `INSERT INTO payments (
//        user_id, amount, method, status, reference,
//        purchase_mode, selected_phases,
//        transaction_id,
//        course_id,
//        reseller_user_id, parent_reseller_user_id,
//        reseller_retail_price, platform_fee_amount,
//        purpose, scholarship_application_id
//      )
//      VALUES (
//        $1, $2, $3, 'pending', $4,
//        $5, $6,
//        $7,
//        $8,
//        $9, $10,
//        $11, $12,
//        $13, $14
//      )
//      RETURNING *`,
//     [
//       userId,
//       amount,
//       method,
//       transactionRef,
//       purchaseMode,
//       selectedPhases,
//       screenshotUrl,
//       courseId,
//       resellerUserId,
//       parentResellerUserId,
//       resellerRetailPrice,
//       platformFeeAmount,
//       purpose,
//       scholarshipApplicationId,
//     ]
//   );
//   return result.rows[0];
// };

// /**
//  * Get all payments (admin). Paginated, newest first.
//  * @param {number} limit
//  * @param {number} offset
//  * @returns {Promise<{payments: object[], total: number}>}
//  */
// const getAllPayments = async (limit, offset) => {
//   const result = await query(
//     `SELECT p.*, u.full_name as user_name, u.phone as user_phone
//      FROM payments p
//      JOIN users u ON p.user_id = u.id
//      ORDER BY p.created_at DESC
//      LIMIT $1 OFFSET $2`,
//     [limit, offset]
//   );

//   const countResult = await query('SELECT COUNT(*) FROM payments');

//   return {
//     payments: result.rows,
//     total: parseInt(countResult.rows[0].count, 10),
//   };
// };

// /**
//  * Get payments by status (admin). Paginated, newest first.
//  * @param {string} status
//  * @param {number} limit
//  * @param {number} offset
//  * @returns {Promise<{payments: object[], total: number}>}
//  */
// const getPaymentsByStatus = async (status, limit, offset) => {
//   const result = await query(
//     `SELECT p.*, u.full_name as user_name, u.phone as user_phone
//      FROM payments p
//      JOIN users u ON p.user_id = u.id
//      WHERE p.status = $1
//      ORDER BY p.created_at DESC
//      LIMIT $2 OFFSET $3`,
//     [status, limit, offset]
//   );

//   const countResult = await query(
//     'SELECT COUNT(*) FROM payments WHERE status = $1',
//     [status]
//   );

//   return {
//     payments: result.rows,
//     total: parseInt(countResult.rows[0].count, 10),
//   };
// };

// /**
//  * Get a single payment by ID with user context.
//  * @param {string} id
//  * @returns {Promise<object|null>}
//  */
// const getPaymentById = async (id) => {
//   const result = await query(
//     `SELECT p.*, u.full_name as user_name, u.phone as user_phone
//      FROM payments p
//      JOIN users u ON p.user_id = u.id
//      WHERE p.id = $1`,
//     [id]
//   );
//   return result.rows[0] || null;
// };

// /**
//  * Get the most recent payment for a user.
//  * @param {string} userId
//  * @returns {Promise<object|null>}
//  */
// const getUserPayment = async (userId) => {
//   const result = await query(
//     'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
//     [userId]
//   );
//   return result.rows[0] || null;
// };

// /**
//  * Update a payment's status.
//  * @param {string} id
//  * @param {string} status
//  * @returns {Promise<object|null>}
//  */
// const updatePaymentStatus = async (id, status) => {
//   const result = await query(
//     `UPDATE payments SET status = $1 WHERE id = $2 RETURNING *`,
//     [status, id]
//   );
//   return result.rows[0] || null;
// };

// /**
//  * Set payment paid_at timestamp to NOW.
//  * @param {string} id
//  * @returns {Promise<void>}
//  */
// const markPaymentPaid = async (id) => {
//   await query(`UPDATE payments SET paid_at = NOW() WHERE id = $1`, [id]);
// };

// /**
//  * Count pending payments (admin dashboard).
//  * @returns {Promise<number>}
//  */
// const getPendingPaymentsCount = async () => {
//   const result = await query(
//     "SELECT COUNT(*) FROM payments WHERE status = 'pending'"
//   );
//   return parseInt(result.rows[0].count, 10);
// };

// /**
//  * Sum total revenue from approved payments.
//  * @returns {Promise<number>}
//  */
// const getTotalRevenue = async () => {
//   const result = await query(
//     "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'approved'"
//   );
//   return parseFloat(result.rows[0].total);
// };

// module.exports = {
//   createPayment,
//   getAllPayments,
//   getPaymentsByStatus,
//   getPaymentById,
//   getUserPayment,
//   updatePaymentStatus,
//   markPaymentPaid,
//   getPendingPaymentsCount,
//   getTotalRevenue,
// };




/**
 * @fileoverview Payment Database Queries
 *
 * createPayment accepts `courseId` for per-course purchases. The column
 * on the payments table must exist (migration 030 adds it).
 *
 * Path: apps/api/src/database/queries/payments.js
 */

const { query } = require('../pool');

const createPayment = async ({
  userId,
  amount,
  method,
  transactionRef,
  screenshotUrl = null,
  courseId = null,
  resellerUserId = null,
  parentResellerUserId = null,
  resellerRetailPrice = null,
  platformFeeAmount = null,
  purchaseMode = 'full-course',
  selectedPhases = null,
  purpose = 'course',
  scholarshipApplicationId = null,
}) => {
  const result = await query(
    `INSERT INTO payments (
       user_id, amount, method, status, reference,
       purchase_mode, selected_phases,
       transaction_id,
       course_id,
       reseller_user_id, parent_reseller_user_id,
       reseller_retail_price, platform_fee_amount,
       purpose, scholarship_application_id
     )
     VALUES (
       $1, $2, $3, 'pending', $4,
       $5, $6,
       $7,
       $8,
       $9, $10,
       $11, $12,
       $13, $14
     )
     RETURNING *`,
    [
      userId,
      amount,
      method,
      transactionRef,
      purchaseMode,
      selectedPhases,
      screenshotUrl,
      courseId,
      resellerUserId,
      parentResellerUserId,
      resellerRetailPrice,
      platformFeeAmount,
      purpose,
      scholarshipApplicationId,
    ]
  );
  return result.rows[0];
};

/**
 * Get all payments (admin). Paginated.
 */
const getAllPayments = async (limit, offset) => {
  const result = await query(
    `SELECT p.*, u.full_name as user_name, u.phone as user_phone,
            c.title as course_title
     FROM payments p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN courses c ON p.course_id = c.id
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await query('SELECT COUNT(*) FROM payments');
  return {
    payments: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

const getPaymentsByStatus = async (status, limit, offset) => {
  const result = await query(
    `SELECT p.*, u.full_name as user_name, u.phone as user_phone,
            c.title as course_title
     FROM payments p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN courses c ON p.course_id = c.id
     WHERE p.status = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );
  const countResult = await query(
    'SELECT COUNT(*) FROM payments WHERE status = $1',
    [status]
  );
  return {
    payments: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

const getPaymentById = async (id) => {
  const result = await query(
    `SELECT p.*, u.full_name as user_name, u.phone as user_phone,
            c.title as course_title
     FROM payments p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN courses c ON p.course_id = c.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const getUserPayment = async (userId) => {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
};

const updatePaymentStatus = async (id, status) => {
  const result = await query(
    `UPDATE payments SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
};

const markPaymentPaid = async (id) => {
  await query(`UPDATE payments SET paid_at = NOW() WHERE id = $1`, [id]);
};

const getPendingPaymentsCount = async () => {
  const result = await query(
    "SELECT COUNT(*) FROM payments WHERE status = 'pending'"
  );
  return parseInt(result.rows[0].count, 10);
};

const getTotalRevenue = async () => {
  const result = await query(
    "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'approved'"
  );
  return parseFloat(result.rows[0].total);
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByStatus,
  getPaymentById,
  getUserPayment,
  updatePaymentStatus,
  markPaymentPaid,
  getPendingPaymentsCount,
  getTotalRevenue,
};