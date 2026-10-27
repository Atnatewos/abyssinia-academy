/**
 * @fileoverview Shared Constants for Course Configuration
 * Reusable values used across all week and phase files
 * Path: packages/shared/courses/fullstack-web-development/shared/constants.js
 */

const YOUTUBE_BASE = 'https://www.youtube.com/embed';

const DURATIONS = {
  SHORT: '30 mins',
  STANDARD: '45 mins',
  LONG: '60 mins',
  EXTENDED: '90 mins',
};

const RESOURCE_TYPES = {
  PDF: 'pdf',
  ZIP: 'zip',
  LINK: 'link',
  FILE: 'file',
};

const FREE_PREVIEW = true;
const LOCKED = false;

module.exports = {
  YOUTUBE_BASE,
  DURATIONS,
  RESOURCE_TYPES,
  FREE_PREVIEW,
  LOCKED,
};