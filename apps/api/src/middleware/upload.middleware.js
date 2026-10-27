/**
 * @fileoverview File Upload Middleware
 * Multer configuration for Cloudinary uploads
 * Path: apps/api/src/middleware/upload.middleware.js
 */

const multer = require('multer');
const { paymentStorage, thumbnailStorage } = require('../config/cloudinary');
const { payments } = require('../../../../packages/shared/config');

/**
 * File filter for payment screenshots
 */
const paymentFileFilter = (req, file, cb) => {
  const allowedTypes = payments.screenshotUpload.allowedTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

/**
 * Multer instance for payment screenshot uploads
 */
const uploadPaymentScreenshot = multer({
  storage: paymentStorage,
  fileFilter: paymentFileFilter,
  limits: {
    fileSize: payments.screenshotUpload.maxSize,
  },
}).single('screenshot');

/**
 * Multer instance for course thumbnail uploads
 */
const uploadThumbnail = multer({
  storage: thumbnailStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('thumbnail');

/**
 * Handle upload errors gracefully
 */
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds the maximum limit.',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      
      next();
    });
  };
};

module.exports = {
  uploadPaymentScreenshot: handleUpload(uploadPaymentScreenshot),
  uploadThumbnail: handleUpload(uploadThumbnail),
};