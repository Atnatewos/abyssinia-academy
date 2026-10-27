-- ============================================================================
-- Migration: 021_add_god_mode.sql
-- 
-- Path: apps/api/src/database/migrations/021_add_god_mode.sql
-- ============================================================================

BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS banned_reason TEXT,
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_password_reset_token 
ON users(password_reset_token) 
WHERE password_reset_token IS NOT NULL;

COMMIT;