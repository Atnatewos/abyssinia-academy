/**
 * @fileoverview GET | POST /api/admin/scholarships
 *
 * Admin CRUD for scholarship campaigns. List + create.
 *
 * Path: apps/web/pages/api/admin/scholarships/index.js
 */

import { methodNotAllowed } from '../../../../lib/scholarships/http/response';
import {
  handleAdminListCampaigns,
  handleAdminCreateCampaign,
} from '../../../../lib/scholarships/http/handlers/admin-campaigns';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleAdminListCampaigns(req, res);
  if (req.method === 'POST') return handleAdminCreateCampaign(req, res);
  return methodNotAllowed(res, ['GET', 'POST']);
}