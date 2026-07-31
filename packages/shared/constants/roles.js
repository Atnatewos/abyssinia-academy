/**
 * @fileoverview User Role Constants
 * Role definitions and permission checks
 * Path: packages/shared/constants/roles.js
 */

const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
};

const PERMISSIONS = {
  [ROLES.STUDENT]: [
    'view:courses',
    'view:own-profile',
    'submit:payment',
    'view:own-progress',
    'update:own-progress',
  ],
  [ROLES.ADMIN]: [
    'view:dashboard',
    'view:all-students',
    'view:all-payments',
    'approve:payment',
    'reject:payment',
    'create:course',
    'update:course',
  ],
  [ROLES.SUPER_ADMIN]: [
    'view:dashboard',
    'view:all-students',
    'view:all-payments',
    'approve:payment',
    'reject:payment',
    'create:course',
    'update:course',
    'delete:course',
    'create:admin',
    'manage:settings',
  ],
};

module.exports = { ROLES, PERMISSIONS };