-- ============================================================================
-- Migration: 030_add_course_id_to_payments.sql
--
-- Purpose:
--   The payment flow now resolves prices from the course record when a
--   buyer purchases a specific course (instead of the global pricing).
--   The `course_id` column must exist on `payments` to persist that
--   attribution and to link approved enrollments to their source course.
--
-- This migration also backfills existing payments that were made through
-- the global pricing path (no course association) — they stay NULL.
--
-- Idempotency:
--   All ALTER TABLE / CREATE INDEX use IF NOT EXISTS. Safe to re-run.
--
-- Rollback:
--   ALTER TABLE payments DROP COLUMN IF EXISTS course_id;
--
-- Path: apps/api/src/database/migrations/030_add_course_id_to_payments.sql
-- ============================================================================

BEGIN;

-- ── Course attribution column ──────────────────────────────────────────
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS course_id UUID
    REFERENCES courses(id) ON DELETE SET NULL;

COMMENT ON COLUMN payments.course_id IS
  'UUID of the course being purchased. NULL for global/full-platform purchases made without a specific course context.';

-- ── Fast lookup for admin reporting ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_course
  ON payments(course_id)
  WHERE course_id IS NOT NULL;

-- ── Verification ──────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'course_id'
  ) THEN
    RAISE EXCEPTION 'Migration 030 failed — payments.course_id missing.';
  END IF;
  RAISE NOTICE '✅ Migration 030 verified: payments.course_id exists.';
END $$;

COMMIT;