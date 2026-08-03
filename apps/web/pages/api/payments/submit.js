/**
 * @fileoverview Payment Submission API Route
 * Handles payment proof submission with support for both full course and individual phase purchases
 * Path: apps/web/pages/api/payments/submit.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse multipart form data from the request
 * Simple parser for FormData with file upload support
 */
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundary = contentType.split('boundary=')[1];

      if (!boundary) {
        resolve({ fields: {}, file: null });
        return;
      }

      const parts = buffer.toString().split(`--${boundary}`);
      const fields = {};
      let file = null;

      for (const part of parts) {
        if (part.includes('Content-Disposition') && part.includes('name=')) {
          const nameMatch = part.match(/name="([^"]+)"/);
          const filenameMatch = part.match(/filename="([^"]+)"/);

          if (nameMatch) {
            const name = nameMatch[1];
            const valueStart = part.indexOf('\r\n\r\n');
            if (valueStart !== -1) {
              let value = part.substring(valueStart + 4);
              value = value.replace(/\r\n$/, '').trim();

              if (filenameMatch) {
                file = {
                  fieldname: name,
                  originalname: filenameMatch[1],
                  buffer: Buffer.from(value, 'binary'),
                };
              } else {
                fields[name] = value;
              }
            }
          }
        }
      }

      resolve({ fields, file });
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    /*
     * Authenticate the request
     */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
     * Verify user exists
     */
    const userResult = await pool.query('SELECT id, full_name, phone FROM users WHERE id = $1', [decoded.userId]);
    if (!userResult.rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];

    /*
     * Parse multipart form data
     */
    const { fields, file } = await parseFormData(req);

    const {
      fullName,
      phone,
      paymentMethod,
      transactionRef,
      purchaseMode = 'full-course',
      courseId = 'fullstack-web-engineering-masterclass',
      selectedPhases: selectedPhasesRaw,
      amount: amountRaw,
    } = fields;

    /*
     * Parse selected phases if provided
     */
    let selectedPhases = null;
    if (purchaseMode === 'individual-phases' && selectedPhasesRaw) {
      try {
        selectedPhases = JSON.parse(selectedPhasesRaw);
      } catch {
        selectedPhases = selectedPhasesRaw.split(',').map((s) => s.trim());
      }
    }

    const amount = parseInt(amountRaw, 10) || 0;

    /*
     * Validate required fields
     */
    if (!fullName || !phone || !paymentMethod || !transactionRef) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, payment method, and transaction reference are required.',
      });
    }

    if (purchaseMode === 'individual-phases' && (!selectedPhases || selectedPhases.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one phase must be selected for individual phase purchase.',
      });
    }

    /*
     * Create payment record
     */
    const paymentResult = await pool.query(
      `INSERT INTO payments (user_id, amount, method, status, reference, created_at)
       VALUES ($1, $2, $3, 'pending', $4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [user.id, amount, paymentMethod, transactionRef]
    );

    /*
     * Update user payment status
     */
    await pool.query(
      `UPDATE users
       SET payment_method = $1,
           payment_status = 'pending',
           payment_amount = $2,
           payment_ref = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [paymentMethod, amount, transactionRef, user.id]
    );

    /*
     * TODO: Handle screenshot upload to Cloudinary when file is present
     * This will be implemented when Cloudinary upload is configured for API routes
     */

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully. Waiting for admin approval.',
      data: {
        paymentId: paymentResult.rows[0].id,
        status: 'pending',
        purchaseMode,
        selectedPhases,
      },
    });
  } catch (error) {
    console.error('Payment submission error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payment submission failed. Please try again.',
    });
  }
}