/**
 * @fileoverview Next.js Configuration
 * Path aliases and build settings
 * Path: apps/web/next.config.js
 */

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['jsx', 'js'],
  
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com', 'img.youtube.com'],
    formats: ['image/avif', 'image/webp'],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, '.'),
      '@components': path.join(__dirname, 'components'),
      '@context': path.join(__dirname, 'context'),
      '@hooks': path.join(__dirname, 'hooks'),
      '@lib': path.join(__dirname, 'lib'),
      '@styles': path.join(__dirname, 'styles'),
      '@shared': path.join(__dirname, '..', '..', 'packages', 'shared'),
    };
    return config;
  },
};

module.exports = nextConfig;