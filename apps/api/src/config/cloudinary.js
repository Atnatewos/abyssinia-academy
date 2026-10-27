/**
 * @fileoverview Cloudinary Configuration
 * Image and file upload service configuration
 * All credentials sourced from environment variables — zero hardcoded values.
 * Path: apps/api/src/config/cloudinary.js
 */

const cloudinary = require('cloudinary').v2;

/*
 * Configure Cloudinary with environment variables
 * These must be set in the Express server .env file
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file on disk
 * @param {object} options - Upload options
 * @param {string} [options.folder] - Cloudinary folder path
 * @returns {Promise<object>} Upload result with secure_url, public_id, etc.
 */
const uploadFile = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'abyssinia-academy',
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary by its public ID
 * @param {string} publicId - The Cloudinary public ID to delete
 * @returns {Promise<object>} Deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile,
};