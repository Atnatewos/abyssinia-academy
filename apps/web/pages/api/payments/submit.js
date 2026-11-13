// /**
//  * @fileoverview Payment Submission API Route
//  *
//  * Handles payment proof submission. Validates discounts server-side to
//  * ensure the user cannot tamper with the final price.
//  *
//  * Attribution priority (highest wins):
//  *   1. RESELLER code (?res= param or form `resellerCode`)
//  *      → overrides base price with reseller's custom_price
//  *      → stores reseller_user_id, parent_reseller_user_id, platform_fee_amount
//  *      → NO discounts applied (reseller price IS the price)
//  *   2. SCHOLARSHIP fee (purpose='scholarship_registration')
//  *      → amount from campaign, no attribution, no discounts
//  *   3. LEGACY AGENT (agentId / pending_agent_id / registered_via_agent_id)
//  *      → preserves existing 10% agent discount behavior
//  *   4. STANDARD course purchase
//  *      → base price, optional discounts/credits
//  *
//  * Path: apps/web/pages/api/payments/submit.js
//  */

// import { Pool } from 'pg';
// import crypto from 'crypto';
// import jwt from 'jsonwebtoken';
// import { uploadToCloudinary } from '../../../lib/cloudinary';
// import {
//   getPaymentConfig,
//   getAgentConfig,
//   isAgentsEnabled,
//   getScholarshipRegistrationFeeConfig,
// } from '../../../lib/config';
// import { calculateCombinedDiscount } from '@shared/utils/pricing';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl:
//     process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
//       ? { rejectUnauthorized: false }
//       : false,
// });

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// /**
//  * Short id for correlating client errors with server logs.
//  *
//  * @returns {string}
//  */
// const newErrorId = () => crypto.randomBytes(6).toString('hex');

// /**
//  * Parse multipart form data using a boundary-based approach.
//  *
//  * @param {object} req - Next.js request
//  * @returns {Promise<{fields: object, file: object|null}>}
//  */
// async function parseFormData(req) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];

//     req.on('data', (chunk) => {
//       chunks.push(chunk);
//     });

//     req.on('end', () => {
//       const fullBuffer = Buffer.concat(chunks);
//       const contentType = req.headers['content-type'] || '';

//       const boundaryMatch = contentType.match(/boundary=(.+)$/);
//       const boundary = boundaryMatch ? boundaryMatch[1].trim() : null;

//       if (!boundary) {
//         try {
//           const text = fullBuffer.toString();
//           const parsed = JSON.parse(text);
//           resolve({ fields: parsed, file: null });
//         } catch {
//           resolve({ fields: {}, file: null });
//         }
//         return;
//       }

//       const fields = {};
//       let file = null;

//       const fullText = fullBuffer.toString('binary');
//       const boundaryDelimiter = `--${boundary}`;
//       const parts = fullText.split(boundaryDelimiter);

//       for (const part of parts) {
//         if (
//           !part ||
//           part === '--' ||
//           part === '--\r\n' ||
//           part.trim() === '--'
//         ) {
//           continue;
//         }

//         const cleanPart = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
//         if (!cleanPart || cleanPart.length < 10) continue;

//         const headerBodySeparator = cleanPart.indexOf('\r\n\r\n');
//         if (headerBodySeparator === -1) continue;

//         const headerSection = cleanPart.substring(0, headerBodySeparator);
//         const bodySection = cleanPart.substring(headerBodySeparator + 4);

//         const nameMatch = headerSection.match(/name="([^"]+)"/);
//         const filenameMatch = headerSection.match(/filename="([^"]+)"/);

//         if (!nameMatch) continue;

//         const fieldName = nameMatch[1];

//         if (filenameMatch) {
//           const filename = filenameMatch[1];
//           const fileBuffer = Buffer.from(bodySection, 'binary');

//           let mimetype = 'image/jpeg';
//           if (filename.endsWith('.png')) mimetype = 'image/png';
//           else if (filename.endsWith('.webp')) mimetype = 'image/webp';
//           else if (filename.endsWith('.gif')) mimetype = 'image/gif';

//           file = {
//             fieldname: fieldName,
//             originalname: filename,
//             buffer: fileBuffer,
//             mimetype,
//             size: fileBuffer.length,
//           };
//         } else {
//           const value = bodySection.replace(/\r\n$/, '').trim();
//           fields[fieldName] = value;
//         }
//       }

//       resolve({ fields, file });
//     });

//     req.on('error', (err) => {
//       reject(err);
//     });
//   });
// }

// /**
//  * Standard UUID shape check.
//  *
//  * @param {string} value
//  * @returns {boolean}
//  */
// const looksLikeUuid = (value) =>
//   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// /**
//  * Cache the result of "does pending_agent_id exist" so we don't query
//  * information_schema on every request.
//  *
//  * @type {boolean|null}
//  */
// let pendingAgentColumnChecked = null;

// async function hasPendingAgentColumn() {
//   if (pendingAgentColumnChecked !== null) return pendingAgentColumnChecked;

//   try {
//     const result = await pool.query(
//       `SELECT 1 FROM information_schema.columns
//        WHERE table_schema = 'public'
//          AND table_name = 'users'
//          AND column_name = 'pending_agent_id'`
//     );
//     pendingAgentColumnChecked = result.rows.length > 0;
//   } catch (err) {
//     console.error(
//       'pending_agent_id column check failed, assuming absent:',
//       err.message
//     );
//     pendingAgentColumnChecked = false;
//   }

//   return pendingAgentColumnChecked;
// }

// const normalizeAttributionInput = (rawValue) => {
//   if (rawValue === null || rawValue === undefined) return '';
//   return String(rawValue).trim();
// };

// /**
//  * Resolve a raw attribution token to a validated agent user UUID.
//  *
//  * @param {string} rawValue - Raw agent_id or agent_code value from the form
//  * @param {string} buyerId - Buyer's user UUID
//  * @returns {Promise<string|null>} Validated agent user UUID or null
//  */
// async function resolveAgentAttribution(rawValue, buyerId) {
//   if (!isAgentsEnabled()) return null;

//   const clean = normalizeAttributionInput(rawValue);
//   if (!clean) return null;

//   try {
//     let result;

//     if (looksLikeUuid(clean)) {
//       if (clean === buyerId) return null;
//       result = await pool.query(
//         `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
//          FROM agent_codes ac
//          LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
//          WHERE ac.user_id = $1`,
//         [clean]
//       );
//     } else {
//       result = await pool.query(
//         `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
//          FROM agent_codes ac
//          LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
//          WHERE LOWER(ac.code) = LOWER($1)`,
//         [clean]
//       );
//     }

//     if (result.rows.length === 0) return null;

//     const row = result.rows[0];
//     if (!row.is_active) return null;
//     if (row.settings_active === false) return null;
//     if (row.user_id === buyerId) return null;

//     return row.user_id;
//   } catch (error) {
//     console.error('Agent attribution resolution failed:', {
//       rawValue: clean.slice(0, 16),
//       error: error.message,
//     });
//     return null;
//   }
// }

// /**
//  * Resolve a reseller code to the reseller profile, its parent (if any),
//  * the effective retail price, and the platform fee amount.
//  *
//  * Returns null when:
//  *   - The code is empty, malformed, or not found
//  *   - The reseller profile is not 'active'
//  *   - The reseller is the buyer themselves (self-purchase prevention)
//  *   - The reseller system is disabled in config
//  *
//  * Price and platform fee are computed SERVER-SIDE from config — never
//  * trusted from the client.
//  *
//  * @param {string} rawCode - Raw reseller code from form or ?res= param
//  * @param {string} buyerUserId - UUID of the buyer
//  * @returns {Promise<{
//  *   profile: object,
//  *   parent: object|null,
//  *   retailPrice: number,
//  *   platformFee: number
//  * }|null>}
//  */
// async function resolveResellerAttribution(rawCode, buyerUserId) {
//   const clean = String(rawCode || '').trim().toUpperCase();
//   if (!clean) return null;

//   try {
//     /* Load reseller profile by code */
//     const result = await pool.query(
//       `SELECT rp.id, rp.user_id, rp.reseller_code, rp.custom_price,
//               rp.status, rp.parent_reseller_id
//        FROM reseller_profiles rp
//        WHERE rp.reseller_code = $1
//        LIMIT 1`,
//       [clean]
//     );

//     if (result.rows.length === 0) return null;

//     const profile = result.rows[0];
//     if (profile.status !== 'active') return null;
//     if (profile.user_id === buyerUserId) return null;

//     /* Load parent profile (if any) for parent-bonus attribution */
//     let parent = null;
//     if (profile.parent_reseller_id) {
//       const parentResult = await pool.query(
//         'SELECT id, user_id FROM reseller_profiles WHERE id = $1',
//         [profile.parent_reseller_id]
//       );
//       if (parentResult.rows.length > 0) parent = parentResult.rows[0];
//     }

//     /*
//      * Load reseller config to verify the system is enabled and to compute
//      * the platform fee from the config-driven percentage. This must happen
//      * AFTER profile resolution so a disabled system silently falls back to
//      * standard pricing instead of blocking purchases.
//      */
//     const { loadResellerConfig } = require('@shared/reseller');
//     const db = { query: (text, params) => pool.query(text, params) };
//     const resellerConfig = await loadResellerConfig({ db });

//     if (!resellerConfig.enabled) return null;

//     const retailPrice = parseFloat(profile.custom_price);
//     const platformFeePercent = resellerConfig.commission.platformFeePercent;
//     const platformFee =
//       Math.round(retailPrice * (platformFeePercent / 100) * 100) / 100;

//     return { profile, parent, retailPrice, platformFee };
//   } catch (error) {
//     console.error('Reseller attribution resolution failed:', {
//       rawCode: clean.slice(0, 16),
//       error: error.message,
//     });
//     return null;
//   }
// }

// /**
//  * Resolve the expected registration fee amount for a scholarship
//  * application. Enforces:
//  *   - Application belongs to this user
//  *   - Application status is 'pending_payment'
//  *   - Campaign still has an open application window
//  *   - Campaign fee > 0
//  *
//  * @param {string} applicationId
//  * @param {string} userId
//  * @returns {Promise<{ amount: number, campaignId: string, campaignName: string }>}
//  * @throws Will throw a structured error object on validation failure
//  */
// async function resolveScholarshipFee(applicationId, userId) {
//   if (!applicationId || !looksLikeUuid(applicationId)) {
//     throw Object.assign(new Error('Valid scholarship applicationId is required.'), {
//       status: 400,
//     });
//   }

//   const result = await pool.query(
//     `SELECT a.id, a.status, a.applicant_user_id, a.payment_due_at,
//             c.id AS campaign_id, c.name AS campaign_name,
//             c.registration_fee_etb, c.is_active AS campaign_active,
//             c.applications_close_at
//      FROM scholarship_applications a
//      JOIN scholarship_campaigns c ON c.id = a.campaign_id
//      WHERE a.id = $1`,
//     [applicationId]
//   );

//   const row = result.rows[0];
//   if (!row) {
//     throw Object.assign(new Error('Scholarship application not found.'), {
//       status: 404,
//     });
//   }
//   if (row.applicant_user_id !== userId) {
//     throw Object.assign(
//       new Error('You can only pay fees for your own applications.'),
//       { status: 403 }
//     );
//   }
//   if (row.status !== 'pending_payment') {
//     throw Object.assign(
//       new Error(
//         `This application is in status "${row.status}", not "pending_payment".`
//       ),
//       { status: 400 }
//     );
//   }
//   if (!row.campaign_active) {
//     throw Object.assign(
//       new Error('The scholarship campaign is no longer active.'),
//       { status: 400 }
//     );
//   }
//   if (row.payment_due_at && new Date(row.payment_due_at) < new Date()) {
//     throw Object.assign(
//       new Error('The registration fee payment deadline has passed.'),
//       { status: 400 }
//     );
//   }

//   const amount = Number(row.registration_fee_etb);
//   if (!Number.isFinite(amount) || amount <= 0) {
//     throw Object.assign(
//       new Error('This campaign has no registration fee to pay.'),
//       { status: 400 }
//     );
//   }

//   return {
//     amount,
//     campaignId: row.campaign_id,
//     campaignName: row.campaign_name,
//   };
// }

// /**
//  * POST /api/payments/submit
//  */
// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res
//       .status(405)
//       .json({ success: false, message: 'Method not allowed' });
//   }

//   const errorId = newErrorId();

//   try {
//     /* ── Authenticate ── */
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'No token provided.' });
//     }

//     const token = authHeader.split(' ')[1];

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (jwtError) {
//       console.error(`[${errorId}] JWT verification failed:`, jwtError.message);
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid or expired token.' });
//     }

//     const includePendingAgent = await hasPendingAgentColumn();
//     const userSelect = includePendingAgent
//       ? `SELECT id, full_name, phone, referred_by_code,
//                 referral_discount_percent, pending_agent_id, registered_via_agent_id
//          FROM users WHERE id = $1`
//       : `SELECT id, full_name, phone, referred_by_code,
//                 referral_discount_percent, NULL::uuid AS pending_agent_id, registered_via_agent_id
//          FROM users WHERE id = $1`;

//     const userResult = await pool.query(userSelect, [decoded.userId]);

//     if (!userResult.rows[0]) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'User not found.' });
//     }

//     const user = userResult.rows[0];

//     /* ── Parse multipart form ── */
//     const { fields, file } = await parseFormData(req);

//     const {
//       fullName,
//       phone,
//       paymentMethod,
//       transactionRef,
//       purchaseMode = 'full-course',
//       selectedPhases: selectedPhasesRaw,
//       amount: amountRaw,
//       referralDiscountPercent: referralDiscountPercentRaw,
//       referralDiscountAmount: referralDiscountAmountRaw,
//       discountCode: discountCodeRaw,
//       discountCodeAmount: discountCodeAmountRaw,
//       creditApplied: creditAppliedRaw,
//       agentId: agentIdRaw,
//       isAgentBuyer: isAgentBuyerRaw,
//       purpose: purposeRaw,
//       scholarshipApplicationId: scholarshipApplicationIdRaw,
//       resellerCode: resellerCodeRaw,
//     } = fields;

//     let selectedPhases = null;
//     if (purchaseMode === 'individual-phases' && selectedPhasesRaw) {
//       try {
//         selectedPhases = JSON.parse(selectedPhasesRaw);
//       } catch {
//         selectedPhases = selectedPhasesRaw.split(',').map((s) => s.trim());
//       }
//     }

//     const amount = parseInt(amountRaw, 10) || 0;
//     const referralDiscountPercent = parseFloat(referralDiscountPercentRaw) || 0;
//     const referralDiscountAmount = parseInt(referralDiscountAmountRaw, 10) || 0;
//     const discountCode = discountCodeRaw?.trim().toUpperCase() || null;
//     const discountCodeAmount = parseInt(discountCodeAmountRaw, 10) || 0;
//     const creditApplied = parseInt(creditAppliedRaw, 10) || 0;
//     const isAgentBuyer = isAgentBuyerRaw === 'true';

//     /*
//      * Purpose discriminator. Defaults to 'course' for backward compatibility
//      * with every existing client that doesn't send this field.
//      */
//     const purpose = purposeRaw === 'scholarship_registration'
//       ? 'scholarship_registration'
//       : 'course';
//     const scholarshipApplicationId =
//       purpose === 'scholarship_registration'
//         ? (scholarshipApplicationIdRaw || '').trim()
//         : null;

//     /* ── Validate required fields ── */
//     if (!fullName || !phone || !paymentMethod || !transactionRef) {
//       return res.status(400).json({
//         success: false,
//         message:
//           'Full name, phone, payment method, and transaction reference are required.',
//       });
//     }

//     /* ====================================================================
//      * AMOUNT VALIDATION — THREE BRANCHES (RESELLER, SCHOLARSHIP, STANDARD)
//      * ================================================================== */

//     let expectedAmount;
//     let resolvedScholarshipFee = null;
//     let resolvedReseller = null;
//     let finalAmount = amount;

//     /* ── Branch 1: RESELLER (highest priority) ── */
//     if (purpose !== 'scholarship_registration' && resellerCodeRaw) {
//       resolvedReseller = await resolveResellerAttribution(resellerCodeRaw, user.id);

//       if (!resolvedReseller) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid or inactive reseller code.',
//         });
//       }

//       /*
//        * Amount must match the reseller's custom price (allow ±1 ETB for
//        * rounding — reseller prices are DECIMAL(10,2) so integers usually
//        * match exactly, but this tolerance protects against JS float drift).
//        */
//       if (Math.abs(amount - resolvedReseller.retailPrice) > 1) {
//         return res.status(400).json({
//           success: false,
//           message: `Price must be ${resolvedReseller.retailPrice} ETB for this reseller. Please refresh the page.`,
//         });
//       }

//       finalAmount = resolvedReseller.retailPrice;
//       expectedAmount = finalAmount;
//     }
//     /* ── Branch 2: SCHOLARSHIP FEE ── */
//     else if (purpose === 'scholarship_registration') {
//       /*
//        * Scholarship registration fee path:
//        *   - Amount comes from campaign.registration_fee_etb (server-side,
//        *     never trusts client).
//        *   - No discounts, no credits, no agent attribution.
//        *   - Application state verified (belongs to user, pending_payment,
//        *     not expired).
//        */
//       try {
//         resolvedScholarshipFee = await resolveScholarshipFee(
//           scholarshipApplicationId,
//           user.id
//         );
//       } catch (feeError) {
//         return res.status(feeError.status || 400).json({
//           success: false,
//           message: feeError.message,
//         });
//       }

//       expectedAmount = resolvedScholarshipFee.amount;

//       /* Exact match (allow ±1 ETB for rounding). No tolerance beyond that. */
//       if (Math.abs(amount - expectedAmount) > 1) {
//         return res.status(400).json({
//           success: false,
//           message: `Registration fee must be exactly ${expectedAmount} ETB. Received ${amount}.`,
//         });
//       }

//       finalAmount = expectedAmount;
//     }
//     /* ── Branch 3: STANDARD COURSE PURCHASE ── */
//     else {
//       /*
//        * Standard course payment path — UNCHANGED from previous behavior.
//        */
//       const paymentConfig = getPaymentConfig();
//       const pricing = paymentConfig.pricing || {};

//       const basePrice = purchaseMode === 'individual-phases'
//         ? (pricing.perPhase?.amountETB || 500) * (selectedPhases?.length || 1)
//         : (pricing.fullCourse?.amountETB || 1000);

//       /* Server-side discount recalculation (0 trust in client) */
//       const expectedBreakdown = calculateCombinedDiscount({
//         basePrice,
//         referralDiscountPercent: isAgentBuyer ? 0 : referralDiscountPercent,
//         discountCodePercent: 0, // Exact code validation requires DB lookup
//         discountCodeFixed: 0,
//         creditAmount: creditApplied,
//         isAgentBuyer,
//       });

//       expectedAmount = expectedBreakdown.finalPrice;

//       /* Allow minor rounding variance */
//       if (amount < expectedAmount - 10) {
//         return res.status(400).json({
//           success: false,
//           message: 'Payment amount validation failed. Please refresh and try again.',
//         });
//       }

//       finalAmount = amount;
//     }

//     /* ── Resolve legacy agent attribution ── */
//     /*
//      * Skip when reseller is being used (reseller takes full precedence)
//      * or when the payment is a scholarship fee (no commission at all).
//      */
//     const agentConfig = getAgentConfig();
//     let validatedAgentId = null;

//     if (purpose !== 'scholarship_registration' && !resolvedReseller) {
//       validatedAgentId = await resolveAgentAttribution(agentIdRaw, user.id);

//       if (!validatedAgentId && user.pending_agent_id) {
//         validatedAgentId = await resolveAgentAttribution(
//           user.pending_agent_id,
//           user.id
//         );
//       }

//       if (!validatedAgentId && user.registered_via_agent_id) {
//         validatedAgentId = user.registered_via_agent_id;
//       }
//     }

//     /* ── Upload screenshot (optional) ── */
//     let screenshotUrl = null;
//     const paymentConfig = getPaymentConfig();
//     const screenshotConfig = paymentConfig.screenshotUpload || {};
//     const maxSize = screenshotConfig.maxSize || 5 * 1024 * 1024;

//     if (file && file.buffer && file.buffer.length > 0) {
//       if (file.size > maxSize) {
//         return res.status(400).json({
//           success: false,
//           message: `Screenshot size must be under ${maxSize / (1024 * 1024)}MB.`,
//         });
//       }

//       const allowedTypes = screenshotConfig.allowedTypes || [
//         'image/jpeg',
//         'image/png',
//         'image/webp',
//       ];
//       if (!allowedTypes.includes(file.mimetype)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Only JPEG, PNG, and WebP images are allowed.',
//         });
//       }

//       try {
//         const uploadResult = await uploadToCloudinary(file.buffer, {
//           folder: 'abyssinia-academy/payments',
//           resourceType: 'image',
//         });

//         if (uploadResult.success) {
//           screenshotUrl = uploadResult.url;
//         } else {
//           console.error(
//             `[${errorId}] Cloudinary upload failed:`,
//             uploadResult.error
//           );
//         }
//       } catch (uploadError) {
//         console.error(
//           `[${errorId}] Cloudinary upload exception:`,
//           uploadError.message
//         );
//       }
//     }

//     /*
//      * Reseller attribution values — extracted once so the INSERT statement
//      * reads clearly and we avoid optional-chaining anywhere near SQL params.
//      */
//     const resellerUserId = resolvedReseller?.profile?.user_id || null;
//     const parentResellerUserId = resolvedReseller?.parent?.user_id || null;
//     const resellerRetailPrice = resolvedReseller?.retailPrice || null;
//     const platformFeeAmount = resolvedReseller?.platformFee || null;

//     /* ── Insert payment ── */
//     /*
//      * Purpose + scholarship_application_id are set explicitly. For
//      * existing course payments, purpose='course' and appId=NULL —
//      * identical to pre-Wave-4 behavior since the columns default to
//      * those exact values.
//      *
//      * Reseller attribution columns (migration 028) are set when a valid
//      * reseller code was resolved. They remain NULL for all other payment
//      * types, preserving the existing behavior for standard purchases,
//      * scholarship fees, and legacy agent payments.
//      *
//      * Discount fields are zeroed out when a reseller code is present:
//      * the reseller's custom price IS the price, and stacking discounts on
//      * top would undercut the reseller's earnings. This is enforced server-
//      * side — a client that submits discount values with a reseller code
//      * gets them ignored.
//      */
//     const paymentResult = await pool.query(
//       `INSERT INTO payments (
//          user_id, amount, method, status, reference,
//          purchase_mode, selected_phases,
//          referral_discount_amount, discount_code_used, discount_code_amount,
//          credit_applied, transaction_id, agent_id,
//          purpose, scholarship_application_id,
//          reseller_user_id, parent_reseller_user_id,
//          reseller_retail_price, platform_fee_amount,
//          created_at
//        )
//        VALUES (
//          $1, $2, $3, 'pending', $4,
//          $5, $6,
//          $7, $8, $9,
//          $10, $11, $12,
//          $13, $14,
//          $15, $16,
//          $17, $18,
//          CURRENT_TIMESTAMP
//        )
//        RETURNING id`,
//       [
//         user.id,
//         finalAmount,
//         paymentMethod,
//         transactionRef,
//         purpose === 'scholarship_registration' ? null : purchaseMode,
//         purpose === 'scholarship_registration' ? null : selectedPhases,
//         resolvedReseller ? 0 : (isAgentBuyer ? 0 : referralDiscountAmount),
//         resolvedReseller ? null : discountCode,
//         resolvedReseller ? 0 : discountCodeAmount,
//         resolvedReseller ? 0 : creditApplied,
//         screenshotUrl,
//         validatedAgentId,
//         purpose,
//         scholarshipApplicationId,
//         resellerUserId,
//         parentResellerUserId,
//         resellerRetailPrice,
//         platformFeeAmount,
//       ]
//     );

//     const paymentId = paymentResult.rows[0].id;

//     /*
//      * Update user payment status. Scholarship-fee payments should NOT
//      * flip the user's payment_status to 'pending' for a course they
//      * didn't buy. Skip this for scholarship purposes.
//      */
//     if (purpose !== 'scholarship_registration') {
//       await pool.query(
//         `UPDATE users
//          SET payment_method = $1,
//              payment_status = 'pending',
//              payment_amount = $2,
//              payment_ref = $3,
//              updated_at = CURRENT_TIMESTAMP
//          WHERE id = $4`,
//         [paymentMethod, finalAmount, transactionRef, user.id]
//       );
//     }

//     /* ── Consume pending_agent_id ── */
//     /*
//      * Skip when a reseller code was used — reseller attribution supersedes
//      * the pending-agent reservation. The pending_agent_id remains available
//      * for the buyer's next non-reseller purchase.
//      */
//     if (
//       purpose !== 'scholarship_registration' &&
//       !resolvedReseller &&
//       includePendingAgent &&
//       validatedAgentId &&
//       user.pending_agent_id &&
//       agentConfig?.attribution?.consumeOnFirstPayment !== false
//     ) {
//       try {
//         await pool.query(
//           `UPDATE users
//            SET pending_agent_id = NULL, updated_at = CURRENT_TIMESTAMP
//            WHERE id = $1`,
//           [user.id]
//         );
//       } catch (consumeError) {
//         console.error(
//           `[${errorId}] Failed to consume pending_agent_id:`,
//           consumeError.message
//         );
//       }
//     }

//     /* ── Record discount code usage ── */
//     /*
//      * Scholarship fees never carry a discount code — skip if scholarship.
//      * Reseller purchases also skip discount usage tracking because no
//      * discount was applied (reseller price is authoritative).
//      */
//     if (
//       purpose !== 'scholarship_registration' &&
//       !resolvedReseller &&
//       discountCode &&
//       discountCodeAmount > 0
//     ) {
//       const discountCodeResult = await pool.query(
//         `SELECT id FROM discount_codes WHERE code = $1 AND is_deleted = false`,
//         [discountCode]
//       );

//       if (discountCodeResult.rows.length > 0) {
//         const dcId = discountCodeResult.rows[0].id;

//         await pool.query(
//           `UPDATE discount_codes
//            SET current_total_uses = current_total_uses + 1,
//                updated_at = CURRENT_TIMESTAMP
//            WHERE id = $1`,
//           [dcId]
//         );

//         await pool.query(
//           `INSERT INTO discount_code_usage
//              (discount_code_id, user_id, payment_id, discount_amount,
//               original_amount, final_amount, ip_address, user_agent)
//            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//           [
//             dcId,
//             user.id,
//             paymentId,
//             discountCodeAmount,
//             finalAmount + discountCodeAmount + (isAgentBuyer ? 0 : referralDiscountAmount) + creditApplied,
//             finalAmount,
//             req.headers['x-forwarded-for'] ||
//               req.socket.remoteAddress ||
//               null,
//             req.headers['user-agent'] || null,
//           ]
//         );
//       }
//     }

//     /* ── Verify credit balance ── */
//     /*
//      * Skip credit verification when no credit was applied, when a reseller
//      * was used (credits are disabled for reseller purchases), or when the
//      * payment is a scholarship fee (credits are not applicable).
//      */
//     if (
//       purpose !== 'scholarship_registration' &&
//       !resolvedReseller &&
//       creditApplied > 0
//     ) {
//       const bonusSumResult = await pool.query(
//         `SELECT COALESCE(SUM(amount), 0)::numeric AS total
//          FROM referral_bonuses WHERE user_id = $1`,
//         [user.id]
//       );

//       const creditUsedResult = await pool.query(
//         `SELECT COALESCE(SUM(credit_applied), 0)::numeric AS total
//          FROM payments
//          WHERE user_id = $1 AND status IN ('pending', 'approved')`,
//         [user.id]
//       );

//       const earned = parseFloat(bonusSumResult.rows[0].total);
//       const alreadyUsed = parseFloat(creditUsedResult.rows[0].total);
//       const availableCredit = earned - alreadyUsed;

//       if (creditApplied > availableCredit) {
//         return res.status(400).json({
//           success: false,
//           message: 'Insufficient credit balance.',
//         });
//       }
//     }

//     /* ── Response ── */
//     res.status(200).json({
//       success: true,
//       message:
//         purpose === 'scholarship_registration'
//           ? 'Scholarship registration fee submitted. Waiting for admin approval.'
//           : 'Payment proof submitted successfully. Waiting for admin approval.',
//       data: {
//         paymentId,
//         status: 'pending',
//         purpose,
//         screenshotUrl,
//         purchaseMode: purpose === 'scholarship_registration' ? null : purchaseMode,
//         selectedPhases: purpose === 'scholarship_registration' ? null : selectedPhases,
//         discountCodeApplied: Boolean(discountCode),
//         creditApplied: creditApplied > 0,
//         agentAttributed: Boolean(validatedAgentId),
//         resellerAttributed: Boolean(resolvedReseller),
//         finalAmount,
//         scholarship:
//           purpose === 'scholarship_registration'
//             ? {
//                 applicationId: scholarshipApplicationId,
//                 campaignName: resolvedScholarshipFee?.campaignName || null,
//                 amount: resolvedScholarshipFee?.amount || null,
//               }
//             : null,
//         reseller: resolvedReseller
//           ? {
//               code: resolvedReseller.profile.reseller_code,
//               retailPrice: resolvedReseller.retailPrice,
//               platformFee: resolvedReseller.platformFee,
//             }
//           : null,
//       },
//     });
//   } catch (error) {
//     console.error(`[${errorId}] Payment submission error:`, {
//       message: error.message,
//       code: error.code,
//       detail: error.detail,
//       constraint: error.constraint,
//       stack: error.stack,
//     });

//     const isDev = process.env.NODE_ENV !== 'production';
//     res.status(500).json({
//       success: false,
//       message: 'Payment submission failed. Please try again.',
//       errorId,
//       ...(isDev && {
//         detail: error.message,
//         ...(error.constraint && { constraint: error.constraint }),
//       }),
//     });
//   }
// }



/**
 * @fileoverview Payment Submission API Route
 *
 * Handles payment proof submission for course purchases. Validates the
 * amount and any discount behavior server-side — the client cannot
 * tamper with what it pays.
 *
 * Under the "pay at apply" scholarship model, the `scholarship_registration`
 * purpose on this endpoint is a LEGACY BRIDGE ONLY. New applications
 * create their payment row inside `applyForScholarship`; this endpoint is
 * reachable only for applications that were created under the old
 * deferred-payment model and were migrated with a `pending_payment` state.
 *
 * When handling a scholarship_registration request, this endpoint
 * enforces the following invariants (all rejected with a clear 4xx):
 *   - The application must exist and belong to the caller.
 *   - The application must be in `pending_payment` (legacy state only).
 *   - A `payments` row must NOT already exist for the application.
 *   - A screenshot must be present (per config).
 *
 * Attribution priority (highest wins):
 *   1. RESELLER code — overrides base price; no discounts, no credits.
 *   2. SCHOLARSHIP fee (legacy only) — amount from campaign; no attribution.
 *   3. LEGACY AGENT — 10% discount behavior preserved.
 *   4. STANDARD course purchase — base price with optional discounts/credits.
 *
 * Path: apps/web/pages/api/payments/submit.js
 */

import { Pool } from 'pg';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import {
  getPaymentConfig,
  getAgentConfig,
  isAgentsEnabled,
  getScholarshipRegistrationFeeConfig,
} from '../../../lib/config';
import { calculateCombinedDiscount } from '@shared/utils/pricing';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

export const config = {
  api: { bodyParser: false },
};

const newErrorId = () => crypto.randomBytes(6).toString('hex');

/**
 * Parse multipart form data using a boundary-based approach. Returns the
 * fields map plus an optional file (the payment screenshot).
 */
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const fullBuffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      const boundary = boundaryMatch ? boundaryMatch[1].trim() : null;

      if (!boundary) {
        try {
          resolve({ fields: JSON.parse(fullBuffer.toString()), file: null });
        } catch {
          resolve({ fields: {}, file: null });
        }
        return;
      }

      const fields = {};
      let file = null;
      const fullText = fullBuffer.toString('binary');
      const parts = fullText.split(`--${boundary}`);

      for (const part of parts) {
        if (!part || part === '--' || part === '--\r\n' || part.trim() === '--') continue;
        const cleanPart = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
        if (!cleanPart || cleanPart.length < 10) continue;
        const sep = cleanPart.indexOf('\r\n\r\n');
        if (sep === -1) continue;

        const headerSection = cleanPart.substring(0, sep);
        const bodySection = cleanPart.substring(sep + 4);
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);
        if (!nameMatch) continue;

        const fieldName = nameMatch[1];
        if (filenameMatch) {
          const filename = filenameMatch[1];
          const fileBuffer = Buffer.from(bodySection, 'binary');
          let mimetype = 'image/jpeg';
          if (filename.endsWith('.png')) mimetype = 'image/png';
          else if (filename.endsWith('.webp')) mimetype = 'image/webp';
          else if (filename.endsWith('.gif')) mimetype = 'image/gif';
          file = {
            fieldname: fieldName,
            originalname: filename,
            buffer: fileBuffer,
            mimetype,
            size: fileBuffer.length,
          };
        } else {
          fields[fieldName] = bodySection.replace(/\r\n$/, '').trim();
        }
      }

      resolve({ fields, file });
    });
    req.on('error', reject);
  });
}

const looksLikeUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const normalizeAttributionInput = (rawValue) =>
  rawValue === null || rawValue === undefined ? '' : String(rawValue).trim();

/**
 * Resolve an agent attribution token to a validated agent user UUID.
 */
async function resolveAgentAttribution(rawValue, buyerId) {
  if (!isAgentsEnabled()) return null;
  const clean = normalizeAttributionInput(rawValue);
  if (!clean) return null;

  try {
    const result = looksLikeUuid(clean)
      ? await pool.query(
          `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
           FROM agent_codes ac
           LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
           WHERE ac.user_id = $1`,
          [clean]
        )
      : await pool.query(
          `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
           FROM agent_codes ac
           LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
           WHERE LOWER(ac.code) = LOWER($1)`,
          [clean]
        );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    if (!row.is_active) return null;
    if (row.settings_active === false) return null;
    if (row.user_id === buyerId) return null;
    return row.user_id;
  } catch (error) {
    console.error('Agent attribution resolution failed:', {
      rawValue: clean.slice(0, 16),
      error: error.message,
    });
    return null;
  }
}

/**
 * Resolve a reseller code to the reseller profile + parent + effective
 * price + platform fee.
 */
async function resolveResellerAttribution(rawCode, buyerUserId) {
  const clean = String(rawCode || '').trim().toUpperCase();
  if (!clean) return null;

  try {
    const result = await pool.query(
      `SELECT rp.id, rp.user_id, rp.reseller_code, rp.custom_price,
              rp.status, rp.parent_reseller_id
       FROM reseller_profiles rp
       WHERE rp.reseller_code = $1
       LIMIT 1`,
      [clean]
    );
    if (result.rows.length === 0) return null;
    const profile = result.rows[0];
    if (profile.status !== 'active') return null;
    if (profile.user_id === buyerUserId) return null;

    let parent = null;
    if (profile.parent_reseller_id) {
      const parentResult = await pool.query(
        'SELECT id, user_id FROM reseller_profiles WHERE id = $1',
        [profile.parent_reseller_id]
      );
      if (parentResult.rows.length > 0) parent = parentResult.rows[0];
    }

    const { loadResellerConfig } = require('@shared/reseller');
    const db = { query: (text, params) => pool.query(text, params) };
    const resellerConfig = await loadResellerConfig({ db });
    if (!resellerConfig.enabled) return null;

    const retailPrice = parseFloat(profile.custom_price);
    const platformFeePercent = resellerConfig.commission.platformFeePercent;
    const platformFee =
      Math.round(retailPrice * (platformFeePercent / 100) * 100) / 100;

    return { profile, parent, retailPrice, platformFee };
  } catch (error) {
    console.error('Reseller attribution resolution failed:', {
      rawCode: clean.slice(0, 16),
      error: error.message,
    });
    return null;
  }
}

/**
 * Resolve the expected registration fee for a LEGACY pending_payment
 * application. Enforces ownership, legacy state, and the absence of an
 * existing registration payment.
 */
async function resolveLegacyScholarshipFee(applicationId, userId) {
  if (!applicationId || !looksLikeUuid(applicationId)) {
    throw Object.assign(new Error('Valid scholarship applicationId is required.'), {
      status: 400,
    });
  }

  const result = await pool.query(
    `SELECT a.id, a.status, a.applicant_user_id, a.payment_due_at,
            c.id AS campaign_id, c.name AS campaign_name,
            c.registration_fee_etb, c.is_active AS campaign_active
     FROM scholarship_applications a
     JOIN scholarship_campaigns c ON c.id = a.campaign_id
     WHERE a.id = $1`,
    [applicationId]
  );

  const row = result.rows[0];
  if (!row) {
    throw Object.assign(new Error('Scholarship application not found.'), {
      status: 404,
    });
  }
  if (row.applicant_user_id !== userId) {
    throw Object.assign(
      new Error('You can only pay fees for your own applications.'),
      { status: 403 }
    );
  }
  if (row.status !== 'pending_payment') {
    throw Object.assign(
      new Error(
        `This application is in status "${row.status}". The legacy fee-payment bridge only accepts pending_payment applications.`
      ),
      { status: 400 }
    );
  }
  if (!row.campaign_active) {
    throw Object.assign(
      new Error('The scholarship campaign is no longer active.'),
      { status: 400 }
    );
  }
  if (row.payment_due_at && new Date(row.payment_due_at) < new Date()) {
    throw Object.assign(
      new Error('The registration fee payment deadline has passed.'),
      { status: 400 }
    );
  }

  const amount = Number(row.registration_fee_etb);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw Object.assign(
      new Error('This campaign has no registration fee to pay.'),
      { status: 400 }
    );
  }

  /* Reject if a payment row already exists for this application. */
  const existingPayment = await pool.query(
    `SELECT 1 FROM payments
     WHERE scholarship_application_id = $1
       AND purpose = 'scholarship_registration'
     LIMIT 1`,
    [applicationId]
  );
  if (existingPayment.rows.length > 0) {
    throw Object.assign(
      new Error('A payment is already on file for this application.'),
      { status: 409 }
    );
  }

  return {
    amount,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
  };
}

/**
 * POST /api/payments/submit
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const errorId = newErrorId();

  try {
    /* Authenticate. */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error(`[${errorId}] JWT verification failed:`, jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    const includePendingAgent = await (async () => {
      try {
        const r = await pool.query(
          `SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'users'
             AND column_name = 'pending_agent_id'`
        );
        return r.rows.length > 0;
      } catch {
        return false;
      }
    })();

    const userSelect = includePendingAgent
      ? `SELECT id, full_name, phone, referred_by_code,
                referral_discount_percent, pending_agent_id, registered_via_agent_id
         FROM users WHERE id = $1`
      : `SELECT id, full_name, phone, referred_by_code,
                referral_discount_percent, NULL::uuid AS pending_agent_id, registered_via_agent_id
         FROM users WHERE id = $1`;

    const userResult = await pool.query(userSelect, [decoded.userId]);
    if (!userResult.rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    const user = userResult.rows[0];

    /* Parse form. */
    const { fields, file } = await parseFormData(req);
    const {
      fullName,
      phone,
      paymentMethod,
      transactionRef,
      purchaseMode = 'full-course',
      selectedPhases: selectedPhasesRaw,
      amount: amountRaw,
      referralDiscountPercent: referralDiscountPercentRaw,
      referralDiscountAmount: referralDiscountAmountRaw,
      discountCode: discountCodeRaw,
      discountCodeAmount: discountCodeAmountRaw,
      creditApplied: creditAppliedRaw,
      agentId: agentIdRaw,
      isAgentBuyer: isAgentBuyerRaw,
      purpose: purposeRaw,
      scholarshipApplicationId: scholarshipApplicationIdRaw,
      resellerCode: resellerCodeRaw,
    } = fields;

    let selectedPhases = null;
    if (purchaseMode === 'individual-phases' && selectedPhasesRaw) {
      try {
        selectedPhases = JSON.parse(selectedPhasesRaw);
      } catch {
        selectedPhases = selectedPhasesRaw.split(',').map((s) => s.trim());
      }
    }

    const amount = parseInt(amountRaw, 10) || 0;
    const referralDiscountPercent = parseFloat(referralDiscountPercentRaw) || 0;
    const referralDiscountAmount = parseInt(referralDiscountAmountRaw, 10) || 0;
    const discountCode = discountCodeRaw?.trim().toUpperCase() || null;
    const discountCodeAmount = parseInt(discountCodeAmountRaw, 10) || 0;
    const creditApplied = parseInt(creditAppliedRaw, 10) || 0;
    const isAgentBuyer = isAgentBuyerRaw === 'true';

    const purpose =
      purposeRaw === 'scholarship_registration' ? 'scholarship_registration' : 'course';
    const scholarshipApplicationId =
      purpose === 'scholarship_registration'
        ? (scholarshipApplicationIdRaw || '').trim()
        : null;

    if (!fullName || !phone || !paymentMethod || !transactionRef) {
      return res.status(400).json({
        success: false,
        message:
          'Full name, phone, payment method, and transaction reference are required.',
      });
    }

    let expectedAmount;
    let resolvedScholarshipFee = null;
    let resolvedReseller = null;
    let finalAmount = amount;

    /* ── Branch 1: RESELLER (highest priority, course only) ── */
    if (purpose !== 'scholarship_registration' && resellerCodeRaw) {
      resolvedReseller = await resolveResellerAttribution(resellerCodeRaw, user.id);
      if (!resolvedReseller) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive reseller code.',
        });
      }
      if (Math.abs(amount - resolvedReseller.retailPrice) > 1) {
        return res.status(400).json({
          success: false,
          message: `Price must be ${resolvedReseller.retailPrice} ETB for this reseller. Please refresh the page.`,
        });
      }
      finalAmount = resolvedReseller.retailPrice;
      expectedAmount = finalAmount;
    }
    /* ── Branch 2: LEGACY SCHOLARSHIP FEE ── */
    else if (purpose === 'scholarship_registration') {
      try {
        resolvedScholarshipFee = await resolveLegacyScholarshipFee(
          scholarshipApplicationId,
          user.id
        );
      } catch (feeError) {
        return res
          .status(feeError.status || 400)
          .json({ success: false, message: feeError.message });
      }

      const feeConfig = getScholarshipRegistrationFeeConfig();
      if (
        (feeConfig.requireTransactionRef !== false && !transactionRef?.trim()) ||
        (feeConfig.requireScreenshot !== false && !file)
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Transaction reference and payment screenshot are required for scholarship fee payments.',
        });
      }

      expectedAmount = resolvedScholarshipFee.amount;
      if (Math.abs(amount - expectedAmount) > 1) {
        return res.status(400).json({
          success: false,
          message: `Registration fee must be exactly ${expectedAmount} ETB. Received ${amount}.`,
        });
      }
      finalAmount = expectedAmount;
    }
    /* ── Branch 3: STANDARD COURSE PURCHASE ── */
    else {
      const paymentConfig = getPaymentConfig();
      const pricing = paymentConfig.pricing || {};
      const basePrice =
        purchaseMode === 'individual-phases'
          ? (pricing.perPhase?.amountETB || 500) * (selectedPhases?.length || 1)
          : (pricing.fullCourse?.amountETB || 1000);

      const expectedBreakdown = calculateCombinedDiscount({
        basePrice,
        referralDiscountPercent: isAgentBuyer ? 0 : referralDiscountPercent,
        discountCodePercent: 0,
        discountCodeFixed: 0,
        creditAmount: creditApplied,
        isAgentBuyer,
      });

      expectedAmount = expectedBreakdown.finalPrice;
      if (amount < expectedAmount - 10) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount validation failed. Please refresh and try again.',
        });
      }
      finalAmount = amount;
    }

    /* Resolve legacy agent attribution (course-only). */
    const agentConfig = getAgentConfig();
    let validatedAgentId = null;
    if (purpose !== 'scholarship_registration' && !resolvedReseller) {
      validatedAgentId = await resolveAgentAttribution(agentIdRaw, user.id);
      if (!validatedAgentId && user.pending_agent_id) {
        validatedAgentId = await resolveAgentAttribution(
          user.pending_agent_id,
          user.id
        );
      }
      if (!validatedAgentId && user.registered_via_agent_id) {
        validatedAgentId = user.registered_via_agent_id;
      }
    }

    /* Screenshot upload (optional for course, required for legacy scholarship). */
    let screenshotUrl = null;
    const paymentConfig = getPaymentConfig();
    const screenshotConfig = paymentConfig.screenshotUpload || {};
    const maxSize = screenshotConfig.maxSize || 5 * 1024 * 1024;

    if (file && file.buffer && file.buffer.length > 0) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `Screenshot size must be under ${maxSize / (1024 * 1024)}MB.`,
        });
      }
      const allowedTypes = screenshotConfig.allowedTypes || [
        'image/jpeg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPEG, PNG, and WebP images are allowed.',
        });
      }
      try {
        const uploadResult = await uploadToCloudinary(file.buffer, {
          folder: 'abyssinia-academy/payments',
          resourceType: 'image',
        });
        if (uploadResult.success) screenshotUrl = uploadResult.url;
        else console.error(`[${errorId}] Cloudinary upload failed:`, uploadResult.error);
      } catch (uploadError) {
        console.error(
          `[${errorId}] Cloudinary upload exception:`,
          uploadError.message
        );
      }
    }

    if (purpose === 'scholarship_registration' && !screenshotUrl) {
      const feeConfig = getScholarshipRegistrationFeeConfig();
      if (feeConfig.requireScreenshot !== false) {
        return res.status(400).json({
          success: false,
          message: 'Payment screenshot upload failed. Please try again.',
        });
      }
    }

    const resellerUserId = resolvedReseller?.profile?.user_id || null;
    const parentResellerUserId = resolvedReseller?.parent?.user_id || null;
    const resellerRetailPrice = resolvedReseller?.retailPrice || null;
    const platformFeeAmount = resolvedReseller?.platformFee || null;

    /* Insert payment — one atomic statement. */
    const paymentResult = await pool.query(
      `INSERT INTO payments (
         user_id, amount, method, status, reference,
         purchase_mode, selected_phases,
         referral_discount_amount, discount_code_used, discount_code_amount,
         credit_applied, transaction_id, agent_id,
         purpose, scholarship_application_id,
         reseller_user_id, parent_reseller_user_id,
         reseller_retail_price, platform_fee_amount,
         created_at
       )
       VALUES (
         $1, $2, $3, 'pending', $4,
         $5, $6,
         $7, $8, $9,
         $10, $11, $12,
         $13, $14,
         $15, $16,
         $17, $18,
         CURRENT_TIMESTAMP
       )
       RETURNING id`,
      [
        user.id,
        finalAmount,
        paymentMethod,
        transactionRef,
        purpose === 'scholarship_registration' ? null : purchaseMode,
        purpose === 'scholarship_registration' ? null : selectedPhases,
        resolvedReseller ? 0 : isAgentBuyer ? 0 : referralDiscountAmount,
        resolvedReseller ? null : discountCode,
        resolvedReseller ? 0 : discountCodeAmount,
        resolvedReseller ? 0 : creditApplied,
        screenshotUrl,
        validatedAgentId,
        purpose,
        scholarshipApplicationId,
        resellerUserId,
        parentResellerUserId,
        resellerRetailPrice,
        platformFeeAmount,
      ]
    );

    const paymentId = paymentResult.rows[0].id;

    if (purpose !== 'scholarship_registration') {
      await pool.query(
        `UPDATE users
         SET payment_method = $1,
             payment_status = 'pending',
             payment_amount = $2,
             payment_ref = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [paymentMethod, finalAmount, transactionRef, user.id]
      );
    }

    if (
      purpose !== 'scholarship_registration' &&
      !resolvedReseller &&
      includePendingAgent &&
      validatedAgentId &&
      user.pending_agent_id &&
      agentConfig?.attribution?.consumeOnFirstPayment !== false
    ) {
      try {
        await pool.query(
          `UPDATE users
           SET pending_agent_id = NULL, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [user.id]
        );
      } catch (consumeError) {
        console.error(
          `[${errorId}] Failed to consume pending_agent_id:`,
          consumeError.message
        );
      }
    }

    if (
      purpose !== 'scholarship_registration' &&
      !resolvedReseller &&
      discountCode &&
      discountCodeAmount > 0
    ) {
      const discountCodeResult = await pool.query(
        `SELECT id FROM discount_codes WHERE code = $1 AND is_deleted = false`,
        [discountCode]
      );
      if (discountCodeResult.rows.length > 0) {
        const dcId = discountCodeResult.rows[0].id;
        await pool.query(
          `UPDATE discount_codes
           SET current_total_uses = current_total_uses + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [dcId]
        );
        await pool.query(
          `INSERT INTO discount_code_usage
             (discount_code_id, user_id, payment_id, discount_amount,
              original_amount, final_amount, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            dcId,
            user.id,
            paymentId,
            discountCodeAmount,
            finalAmount +
              discountCodeAmount +
              (isAgentBuyer ? 0 : referralDiscountAmount) +
              creditApplied,
            finalAmount,
            req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
            req.headers['user-agent'] || null,
          ]
        );
      }
    }

    if (
      purpose !== 'scholarship_registration' &&
      !resolvedReseller &&
      creditApplied > 0
    ) {
      const bonusSumResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS total
         FROM referral_bonuses WHERE user_id = $1`,
        [user.id]
      );
      const creditUsedResult = await pool.query(
        `SELECT COALESCE(SUM(credit_applied), 0)::numeric AS total
         FROM payments
         WHERE user_id = $1 AND status IN ('pending', 'approved')`,
        [user.id]
      );
      const earned = parseFloat(bonusSumResult.rows[0].total);
      const alreadyUsed = parseFloat(creditUsedResult.rows[0].total);
      if (creditApplied > earned - alreadyUsed) {
        return res
          .status(400)
          .json({ success: false, message: 'Insufficient credit balance.' });
      }
    }

    res.status(200).json({
      success: true,
      message:
        purpose === 'scholarship_registration'
          ? 'Scholarship registration fee submitted. Waiting for admin approval.'
          : 'Payment proof submitted successfully. Waiting for admin approval.',
      data: {
        paymentId,
        status: 'pending',
        purpose,
        screenshotUrl,
        purchaseMode:
          purpose === 'scholarship_registration' ? null : purchaseMode,
        selectedPhases:
          purpose === 'scholarship_registration' ? null : selectedPhases,
        discountCodeApplied: Boolean(discountCode),
        creditApplied: creditApplied > 0,
        agentAttributed: Boolean(validatedAgentId),
        resellerAttributed: Boolean(resolvedReseller),
        finalAmount,
        scholarship:
          purpose === 'scholarship_registration'
            ? {
                applicationId: scholarshipApplicationId,
                campaignName: resolvedScholarshipFee?.campaignName || null,
                amount: resolvedScholarshipFee?.amount || null,
              }
            : null,
        reseller: resolvedReseller
          ? {
              code: resolvedReseller.profile.reseller_code,
              retailPrice: resolvedReseller.retailPrice,
              platformFee: resolvedReseller.platformFee,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(`[${errorId}] Payment submission error:`, {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack,
    });
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      success: false,
      message: 'Payment submission failed. Please try again.',
      errorId,
      ...(isDev && {
        detail: error.message,
        ...(error.constraint && { constraint: error.constraint }),
      }),
    });
  }
}