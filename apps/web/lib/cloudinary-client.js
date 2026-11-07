/**
 * @fileoverview Client-Side Cloudinary Upload Helper
 *
 * Uses Cloudinary's unsigned upload REST endpoint, which is safe to call
 * directly from the browser. This avoids bundling the `cloudinary` npm
 * package (which depends on Node's `fs` module) into the client bundle.
 *
 * Only uses data the server already exposes publicly:
 *   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (browser-safe)
 *   - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (browser-safe by design)
 *
 * Signed uploads (payment screenshots) continue to use the existing
 * server-side lib/cloudinary.js — no change to that flow.
 *
 * Path: apps/web/lib/cloudinary-client.js
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

/**
 * Upload a single file to Cloudinary via unsigned REST upload.
 *
 * @param {File} file - Browser File object
 * @param {object} [options]
 * @param {string} [options.folder] - Optional folder override
 * @returns {Promise<{success: boolean, url?: string, publicId?: string, error?: string}>}
 */
export const uploadToCloudinary = async (file, options = {}) => {
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return {
      success: false,
      error:
        'Cloudinary client not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          payload?.error?.message ||
          `Cloudinary upload failed (HTTP ${response.status}).`,
      };
    }

    return {
      success: true,
      url: payload.secure_url,
      publicId: payload.public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Network error during upload.',
    };
  }
};