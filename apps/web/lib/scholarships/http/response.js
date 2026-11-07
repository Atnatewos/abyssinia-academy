/**
 * @fileoverview Scholarship HTTP Response Helpers
 *
 * Wraps `res.status().json()` in named helpers so handlers read clearly
 * and success/error shapes are guaranteed consistent across every endpoint.
 *
 * Every response has the shape:
 *   { success: true, data: <payload> }      — 2xx
 *   { success: false, code, message, ... }  — 4xx/5xx (from errors.js)
 *
 * Path: apps/web/lib/scholarships/http/response.js
 */

/**
 * Send a successful response with data.
 *
 * @param {import('next').NextApiResponse} res
 * @param {*} data - Response payload
 * @param {number} [status=200]
 * @param {object} [meta] - Optional metadata (pagination, counts)
 */
export const ok = (res, data, status = 200, meta) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
};

/**
 * Send a 201 Created with data.
 *
 * @param {import('next').NextApiResponse} res
 * @param {*} data
 */
export const created = (res, data) =>
  res.status(201).json({ success: true, data });

/**
 * Send a 204 No Content.
 *
 * @param {import('next').NextApiResponse} res
 */
export const noContent = (res) => res.status(204).end();

/**
 * Reject unsupported HTTP methods with 405.
 *
 * @param {import('next').NextApiResponse} res
 * @param {string[]} allowed - Allowed methods e.g. ['GET','POST']
 */
export const methodNotAllowed = (res, allowed) => {
  res.setHeader('Allow', allowed.join(', '));
  return res.status(405).json({
    success: false,
    code: 'METHOD_NOT_ALLOWED',
    message: `Method not allowed. Allowed: ${allowed.join(', ')}`,
  });
};