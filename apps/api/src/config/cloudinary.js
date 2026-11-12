// /**
//  * @fileoverview Cloudinary Configuration
//  * Image and file upload service configuration
//  * All credentials sourced from environment variables — zero hardcoded values.
//  * Path: apps/api/src/config/cloudinary.js
//  */

// const cloudinary = require('cloudinary').v2;

// /*
//  * Configure Cloudinary with environment variables
//  * These must be set in the Express server .env file
//  */
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// /**
//  * Upload a file to Cloudinary
//  * @param {string} filePath - Path to the file on disk
//  * @param {object} options - Upload options
//  * @param {string} [options.folder] - Cloudinary folder path
//  * @returns {Promise<object>} Upload result with secure_url, public_id, etc.
//  */
// const uploadFile = async (filePath, options = {}) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: options.folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'abyssinia-academy',
//       ...options,
//     });
//     return result;
//   } catch (error) {
//     console.error('Cloudinary upload error:', error.message);
//     throw error;
//   }
// };

// /**
//  * Delete a file from Cloudinary by its public ID
//  * @param {string} publicId - The Cloudinary public ID to delete
//  * @returns {Promise<object>} Deletion result
//  */
// const deleteFile = async (publicId) => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId);
//     return result;
//   } catch (error) {
//     console.error('Cloudinary delete error:', error.message);
//     throw error;
//   }
// };

// module.exports = {
//   cloudinary,
//   uploadFile,
//   deleteFile,
// };

/**
 * @fileoverview Cloudinary Service Configuration
 *
 * Provides:
 *   - A configured Cloudinary v2 instance
 *   - A generic multer storage engine factory (memory-based, streams to
 *     Cloudinary on save) that can be specialized per upload surface
 *   - Upload and delete helpers used by controllers
 *
 * All credentials resolve from platform.config — no hardcoded values.
 *
 * Path: apps/api/src/config/cloudinary.js
 */

const { v2: cloudinary } = require('cloudinary');
const { platform } = require('../../../../packages/shared/config');

cloudinary.config({
  cloud_name: platform.cloudinary.cloudName,
  api_key: platform.cloudinary.apiKey,
  api_secret: platform.cloudinary.apiSecret,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary via a stream.
 *
 * Uses memory buffers because Next.js and Express both operate better with
 * explicit buffering than with disk-backed multer. The stream approach also
 * means the file never touches the server's local filesystem.
 *
 * @param {Buffer} buffer - File content from multer.memoryStorage()
 * @param {object} options - { folder?, publicId?, resourceType?, format? }
 * @returns {Promise<object>} Cloudinary upload result
 * @throws {Error} When the upload fails (wraps the SDK error)
 */
const uploadFile = (buffer, options = {}) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('uploadFile requires a Buffer.');
  }

  const folder =
    options.folder || platform.cloudinary.uploadFolder;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: options.resourceType || 'auto',
        format: options.format,
        allowed_formats: platform.cloudinary.allowedFormats,
      },
      (error, result) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error('[cloudinary] upload failed:', error.message);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a Cloudinary asset by its public ID.
 *
 * @param {string} publicId - Cloudinary public_id (not the URL)
 * @param {object} [options] - { resourceType? } defaults to 'image'
 * @returns {Promise<object>} Delete result
 */
const deleteFile = async (publicId, options = {}) => {
  if (!publicId) {
    throw new Error('deleteFile requires a publicId.');
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: options.resourceType || 'image',
    invalidate: true,
  });
};

/**
 * Extract a Cloudinary public_id from a secure URL.
 * Returns null when the URL is not a Cloudinary URL.
 *
 * @param {string} url - Full Cloudinary URL
 * @returns {string|null}
 */
const publicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const marker = `/${platform.cloudinary.uploadFolder}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  // Strip version prefix (v1234567890/) if present
  const afterFolder = url.slice(idx + marker.length);
  const withoutVersion = afterFolder.replace(/^v\d+\//, '');

  // Strip file extension
  return withoutVersion.replace(/\.[^/.]+$/, '');
};

/**
 * Create a multer-compatible storage engine that streams to Cloudinary.
 *
 * @param {object} options
 * @param {string} options.folder - Cloudinary folder for uploaded assets
 * @param {string} [options.resourceType] - 'image' | 'raw' | 'auto'
 * @returns {object} Multer storage object with _handleFile/_removeFile
 */
const createCloudinaryStorage = ({ folder, resourceType = 'image' }) => ({
  _handleFile(req, file, cb) {
    const chunks = [];
    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('error', cb);
    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = await uploadFile(buffer, { folder, resourceType });
        cb(null, {
          path: result.secure_url,
          publicId: result.public_id,
          size: result.bytes,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      } catch (error) {
        cb(error);
      }
    });
  },

  _removeFile(req, file, cb) {
    const publicId = file.publicId || publicIdFromUrl(file.path);
    if (!publicId) return cb(null);
    deleteFile(publicId, { resourceType }).then(() => cb(null), cb);
  },
});

/* ── Named storages used across the app ───────────────────────────────
 * These are the exports upload.middleware.js expects. Adding a new upload
 * surface means creating one more `createCloudinaryStorage()` call here,
 * not editing the middleware.
 * -------------------------------------------------------------------- */
const paymentStorage = createCloudinaryStorage({
  folder: `${platform.cloudinary.uploadFolder}/payment-screenshots`,
  resourceType: 'image',
});

const thumbnailStorage = createCloudinaryStorage({
  folder: `${platform.cloudinary.uploadFolder}/course-thumbnails`,
  resourceType: 'image',
});

const documentStorage = createCloudinaryStorage({
  folder: `${platform.cloudinary.uploadFolder}/scholarship-documents`,
  resourceType: 'auto',
});

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile,
  publicIdFromUrl,
  createCloudinaryStorage,
  paymentStorage,
  thumbnailStorage,
  documentStorage,
};