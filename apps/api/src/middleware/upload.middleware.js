// /**
//  * @fileoverview File Upload Middleware
//  * Multer configuration for Cloudinary uploads
//  * Path: apps/api/src/middleware/upload.middleware.js
//  */

// const multer = require('multer');
// const { paymentStorage, thumbnailStorage } = require('../config/cloudinary');
// const { payments } = require('../../../../packages/shared/config');

// /**
//  * File filter for payment screenshots
//  */
// const paymentFileFilter = (req, file, cb) => {
//   const allowedTypes = payments.screenshotUpload.allowedTypes;
  
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
//   }
// };

// /**
//  * Multer instance for payment screenshot uploads
//  */
// const uploadPaymentScreenshot = multer({
//   storage: paymentStorage,
//   fileFilter: paymentFileFilter,
//   limits: {
//     fileSize: payments.screenshotUpload.maxSize,
//   },
// }).single('screenshot');

// /**
//  * Multer instance for course thumbnail uploads
//  */
// const uploadThumbnail = multer({
//   storage: thumbnailStorage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// }).single('thumbnail');

// /**
//  * Handle upload errors gracefully
//  */
// const handleUpload = (uploadMiddleware) => {
//   return (req, res, next) => {
//     uploadMiddleware(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         if (err.code === 'LIMIT_FILE_SIZE') {
//           return res.status(400).json({
//             success: false,
//             message: 'File size exceeds the maximum limit.',
//           });
//         }
//         return res.status(400).json({
//           success: false,
//           message: err.message,
//         });
//       }
      
//       if (err) {
//         return res.status(400).json({
//           success: false,
//           message: err.message,
//         });
//       }
      
//       next();
//     });
//   };
// };

// module.exports = {
//   uploadPaymentScreenshot: handleUpload(uploadPaymentScreenshot),
//   uploadThumbnail: handleUpload(uploadThumbnail),
// };

/**
 * @fileoverview Upload Middleware
 *
 * Multer instances configured against the Cloudinary storage engines from
 * config/cloudinary.js. Every limit, file type, and field name resolves
 * from payments.config so an admin can adjust uploads without a code edit.
 *
 * Path: apps/api/src/middleware/upload.middleware.js
 */

const multer = require('multer');
const {
  paymentStorage,
  thumbnailStorage,
  documentStorage,
} = require('../config/cloudinary');
const { payments, scholarships } = require('../../../../packages/shared/config');

/**
 * Wrap a multer middleware in an error handler that returns consistent
 * 400 JSON responses instead of crashing the request.
 *
 * @param {Function} uploadMiddleware - Configured multer middleware
 * @returns {Function} Express-compatible middleware
 */
const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the maximum allowed limit.',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: `Unexpected file field: ${err.field}.`,
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

/**
 * Reject a file whose mimetype is not in the allow-list.
 *
 * @param {string[]} allowedTypes - Accepted MIME types
 * @returns {Function} Multer fileFilter
 */
const createFileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(
    new Error(
      `Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`
    ),
    false
  );
};

/* ── Payment screenshots ─────────────────────────────────────────────── */
const uploadPaymentScreenshot = handleUpload(
  multer({
    storage: paymentStorage,
    fileFilter: createFileFilter(
      payments.screenshotUpload.allowedTypes
    ),
    limits: {
      fileSize: payments.screenshotUpload.maxSize,
    },
  }).single('screenshot')
);

/* ── Course thumbnails ───────────────────────────────────────────────── */
const uploadThumbnail = handleUpload(
  multer({
    storage: thumbnailStorage,
    fileFilter: createFileFilter([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]),
    limits: {
      fileSize: payments.screenshotUpload.maxSize,
    },
  }).single('thumbnail')
);

/* ── Scholarship documents ───────────────────────────────────────────── */
const uploadScholarshipDocument = handleUpload(
  multer({
    storage: documentStorage,
    fileFilter: createFileFilter(
      scholarships?.defaults?.allowedDocumentTypes || [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
      ]
    ),
    limits: {
      fileSize:
        scholarships?.defaults?.maxDocumentSizeBytes || 5 * 1024 * 1024,
    },
  }).single('document')
);

module.exports = {
  uploadPaymentScreenshot,
  uploadThumbnail,
  uploadScholarshipDocument,
};