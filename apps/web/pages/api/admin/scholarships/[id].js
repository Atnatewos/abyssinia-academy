// /**
//  * @fileoverview GET | PUT | DELETE /api/admin/scholarships/[id]
//  *
//  * Admin CRUD for a single campaign. Delete is soft (sets is_active=false).
//  *
//  * Path: apps/web/pages/api/admin/scholarships/[id].js
//  */

// import { methodNotAllowed } from '../../../../lib/scholarships/http/response';
// import {
//   handleAdminGetCampaign,
//   handleAdminUpdateCampaign,
//   handleAdminDeleteCampaign,
// } from '../../../../lib/scholarships/http/handlers/admin-campaigns';

// export default async function handler(req, res) {
//   if (req.method === 'GET') return handleAdminGetCampaign(req, res);
//   if (req.method === 'PUT' || req.method === 'PATCH') {
//     return handleAdminUpdateCampaign(req, res);
//   }
//   if (req.method === 'DELETE') return handleAdminDeleteCampaign(req, res);
//   return methodNotAllowed(res, ['GET', 'PUT', 'PATCH', 'DELETE']);
// }





/**
 * @fileoverview GET | PUT | DELETE /api/admin/scholarships/[id]
 *
 * Admin CRUD for a single campaign. Delete is soft (sets is_active=false).
 *
 * Path: apps/web/pages/api/admin/scholarships/[id].js
 */

import { methodNotAllowed } from '../../../../lib/scholarships/http/response';
import {
  handleAdminGetCampaign,
  handleAdminUpdateCampaign,
  handleAdminDeleteCampaign,
} from '../../../../lib/scholarships/http/handlers/admin-campaigns';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleAdminGetCampaign(req, res);
  if (req.method === 'PUT' || req.method === 'PATCH') {
    return handleAdminUpdateCampaign(req, res);
  }
  if (req.method === 'DELETE') return handleAdminDeleteCampaign(req, res);
  return methodNotAllowed(res, ['GET', 'PUT', 'PATCH', 'DELETE']);
}