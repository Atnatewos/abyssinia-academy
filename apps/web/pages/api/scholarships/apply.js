/**
 * @fileoverview POST /api/scholarships/apply
 *
 * Submit a new scholarship application. Auth required.
 *
 * Path: apps/web/pages/api/scholarships/apply.js
 */

import { handleApply } from '../../../lib/scholarships/http/handlers/student';

export default handleApply;