-- ============================================================================
-- Migration: 019_normalize_agent_codes.sql
--
-- Purpose:
--   Uppercase all agent_codes.code values so lookups never need LOWER()
--   on the indexed column. The app still uses LOWER() defensively for
--   legacy safety, but this migration removes the need.
--
-- Idempotency:
--   - UPDATE with WHERE clause matching the transform — safe to re-run
--
-- Path: apps/api/src/database/migrations/019_normalize_agent_codes.sql
-- ============================================================================

BEGIN;

UPDATE agent_codes
SET code = UPPER(code),
    updated_at = NOW()
WHERE code <> UPPER(code);

COMMIT;