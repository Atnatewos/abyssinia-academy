/**
 * Migration: Add Profile Support Fields
 * Adds avatar, notification preferences, and last_active to users table
 * Path: apps/api/src/database/migrations/003_add_profile_fields.sql
 */

-- Add avatar support
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add notification preferences
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;

-- Add last active tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP;

-- Add profile completion flag
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Add index for last active sorting
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);