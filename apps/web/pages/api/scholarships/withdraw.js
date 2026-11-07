/**
 * @fileoverview POST /api/scholarships/withdraw
 *
 * Withdraw a pending application. Auth required.
 *
 * Path: apps/web/pages/api/scholarships/withdraw.js
 */

import { handleWithdraw } from '../../../lib/scholarships/http/handlers/student';

export default handleWithdraw;