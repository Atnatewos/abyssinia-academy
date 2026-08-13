-- ============================================================================
-- Migration: Admin Settings Table
-- Stores configurable platform settings as key-value JSON.
-- DB-first architecture: admin settings override static config files.
-- Path: apps/api/src/database/migrations/006_create_admin_settings.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_by UUID REFERENCES admins(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

COMMIT;