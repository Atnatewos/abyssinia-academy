/**
 * @fileoverview Cloudinary Client for Next.js API Routes
 * Serverless-compatible Cloudinary upload using the v2 SDK.
 * All credentials sourced from environment variables — zero hardcoded values.
 * Path: apps/web/lib/cloudinary.js
 */

import { v2 as cloudinary } from 'cloudinary';

/*
 * Configure Cloudinary with environment variables
 * These must be set in .env.local and Vercel environment variables
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary
 * Designed for Next.js API routes that receive files as Buffers
 * (not file paths, since serverless has no persistent filesystem)
 *
 * @param {Buffer} fileBuffer - The file data as a Buffer
 * @param {object} options - Upload options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.publicId - Optional custom public ID
 * @param {string} options.resourceType - 'image' | 'auto' (default: 'image')
 * @returns {Promise<object>} Upload result with secure_url, public_id, etc.
 */
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  /*
   * Convert the buffer to a base64 data URI for Cloudinary upload
   * This avoids needing a temp file on disk
   */
  const base64String = fileBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64String}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: options.folder || 'abyssinia-academy/payments',
      public_id: options.publicId || undefined,
      resource_type: options.resourceType || 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a file from Cloudinary by its public ID
 *
 * @param {string} publicId - The Cloudinary public ID to delete
 * @returns {Promise<object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default cloudinary;