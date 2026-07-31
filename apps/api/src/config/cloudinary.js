/**
 * @fileoverview Cloudinary Configuration
 * Image and file upload service setup
 * Path: apps/api/src/config/cloudinary.js
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { platform } = require('../../../../packages/shared/config');

cloudinary.config({
  cloud_name: platform.cloudinary.cloudName,
  api_key: platform.cloudinary.apiKey,
  api_secret: platform.cloudinary.apiSecret,
});

/**
 * Create multer storage for payment screenshots
 */
const paymentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `${platform.cloudinary.uploadFolder}/payments`,
    allowed_formats: platform.cloudinary.allowedFormats,
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

/**
 * Create multer storage for course thumbnails
 */
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `${platform.cloudinary.uploadFolder}/thumbnails`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
  },
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file
 * @param {object} options - Upload options
 * @returns {object} Upload result
 */
const uploadFile = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: platform.cloudinary.uploadFolder,
      ...options,
    });
    return result;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @returns {object} Deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error.message);
    throw error;
  }
};

module.exports = {
  cloudinary,
  paymentStorage,
  thumbnailStorage,
  uploadFile,
  deleteFile,
};