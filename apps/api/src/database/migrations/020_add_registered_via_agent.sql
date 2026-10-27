-- ============================================================================
-- Migration: 020_add_registered_via_agent.sql
--
-- Purpose:
--   Adds users.registered_via_agent_id. Unlike pending_agent_id (which is
--   consumed on the first payment), this column is permanent. It powers the
--   agent dashboard funnel (pending vs converted) and enables the automatic
--   10% agent buyer discount at checkout for any future purchase.
--
-- Path: apps/api/src/database/migrations/020_add_registered_via_agent.sql
-- ============================================================================

BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS registered_via_agent_id UUID
  REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_registered_via_agent_id
ON users(registered_via_agent_id)
WHERE registered_via_agent_id IS NOT NULL;

-- Backfill existing data from the pending column
UPDATE users
SET registered_via_agent_id = pending_agent_id
WHERE pending_agent_id IS NOT NULL AND registered_via_agent_id IS NULL;

COMMIT;