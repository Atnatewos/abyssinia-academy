/**
 * @fileoverview POST /api/admin/scholarships/applications/[appId]/verify-payment
 *
 * Admin confirms a scholarship registration fee payment arrived. Transitions
 * the application from 'pending_payment' → 'pending' so it lands in the
 * review queue.
 *
 * Path: apps/web/pages/api/admin/scholarships/applications/[appId]/verify-payment.js
 */

import { handleAdminVerifyPayment } from '../../../../../../lib/scholarships/http/handlers/admin-applications';

export default handleAdminVerifyPayment;