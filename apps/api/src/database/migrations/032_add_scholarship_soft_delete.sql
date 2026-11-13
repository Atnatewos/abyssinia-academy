-- ============================================================================
-- Migration: 032_add_scholarship_soft_delete.sql
--
-- Allows admins to "delete" a campaign from the UI without breaking foreign
-- key constraints for applicants who have already applied and paid.
-- ============================================================================

BEGIN;

ALTER TABLE scholarship_campaigns
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Update the partial index to exclude deleted campaigns from public queries
DROP INDEX IF EXISTS idx_scholarship_campaigns_active_open;

CREATE INDEX idx_scholarship_campaigns_active_open
  ON scholarship_campaigns (is_active, applications_close_at)
  WHERE is_active = true AND is_deleted = false;

COMMIT;