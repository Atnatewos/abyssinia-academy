-- ============================================================================
-- Migration: 029_course_admin_control.sql
--
-- Purpose:
--   Grants full admin control over courses, phases, weeks, and lessons by
--   adding the columns the admin UI needs to manage content independently
--   of the shared config files.
--
-- Adds:
--   1. courses.price_etb         — per-course price override (nullable)
--   2. courses.price_am          — per-course Amharic price label (nullable)
--   3. phases.price_etb          — per-phase price override (nullable)
--   4. phases.is_published       — draft / publish control (default true)
--   5. weeks.is_published        — draft / publish control (default true)
--   6. lessons.is_published      — draft / publish control (default true)
--
-- The `is_published` columns default to TRUE so every existing row remains
-- visible — no data migration, no surprise disappearances. Admins flip to
-- FALSE to draft content that should be hidden from the public site.
--
-- The `price_etb` columns are nullable by design:
--   - When set       → checkout reads the row's price
--   - When NULL      → checkout falls back to payments.config.fullCourse
--                      or payments.config.perPhase
--
-- Idempotency:
--   - All ALTER TABLE use ADD COLUMN IF NOT EXISTS
--   - All CREATE INDEX use IF NOT EXISTS
--   - Safe to re-run on any environment
--
-- Rollback (if ever needed):
--   ALTER TABLE lessons DROP COLUMN IF EXISTS is_published;
--   ALTER TABLE weeks   DROP COLUMN IF EXISTS is_published;
--   ALTER TABLE phases  DROP COLUMN IF EXISTS is_published, DROP COLUMN IF EXISTS price_etb;
--   ALTER TABLE courses DROP COLUMN IF EXISTS price_am, DROP COLUMN IF EXISTS price_etb;
--
-- Path: apps/api/src/database/migrations/029_course_admin_control.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. COURSES — per-course price override
-- ============================================================================
--
-- When `price_etb` is NULL, checkout falls back to
-- payments.config.pricing.fullCourse.amountETB. This preserves current
-- behaviour for every existing course.
--
-- price_am mirrors the existing title_am/description_am pattern: an
-- Amharic-only display label for the price, used when the site language
-- is set to Amharic. Pure display field — not used in any calculation.
--
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price_etb DECIMAL(10, 2)
    CHECK (price_etb IS NULL OR price_etb >= 0);

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price_am VARCHAR(100);

COMMENT ON COLUMN courses.price_etb IS
  'Per-course price in ETB. When NULL, checkout uses payments.config fullCourse amount.';

COMMENT ON COLUMN courses.price_am IS
  'Amharic display label for the course price. Pure presentation, not used in calculations.';

-- ============================================================================
-- 2. PHASES — per-phase price override + publish control
-- ============================================================================
--
-- Per-phase pricing lets a course charge different amounts for different
-- phases (e.g. Phase 1 free, Phase 5 premium). When NULL, checkout falls
-- back to payments.config.pricing.perPhase.amountETB.
--
-- is_published gates whether the phase appears on the public course page
-- and in the enrollment flow. Defaults to TRUE so no existing data is
-- hidden by the migration.
--
ALTER TABLE phases
  ADD COLUMN IF NOT EXISTS price_etb DECIMAL(10, 2)
    CHECK (price_etb IS NULL OR price_etb >= 0);

ALTER TABLE phases
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN phases.price_etb IS
  'Per-phase price in ETB. When NULL, checkout uses payments.config perPhase amount.';

COMMENT ON COLUMN phases.is_published IS
  'When false, the phase is hidden from public listing and enrollment. Defaults true so existing content is unaffected.';

-- ============================================================================
-- 3. WEEKS — publish control
-- ============================================================================
--
-- Weeks inherit their effective visibility from their phase, but this
-- column allows drafting a single week inside a published phase.
--
ALTER TABLE weeks
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN weeks.is_published IS
  'When false, the week is hidden from public listing even if its phase is published.';

-- ============================================================================
-- 4. LESSONS — publish control
-- ============================================================================
--
-- A single lesson can be drafted (e.g. video not yet uploaded) while its
-- week and phase remain visible. The public filter honors this flag.
--
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN lessons.is_published IS
  'When false, the lesson is hidden from the student portal and public preview.';

-- ============================================================================
-- 5. INDEXES — support the new query patterns
-- ============================================================================
--
-- Queries now filter by is_published at every level. Partial indexes
-- restricted to published rows keep those plans fast — the query
-- planner ignores the (usually few) drafts entirely.
--
-- The price index supports admin order-by-price listings and analytics.
--
CREATE INDEX IF NOT EXISTS idx_phases_course_published
  ON phases (course_id, phase_number)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_weeks_phase_published
  ON weeks (phase_id, week_number)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_lessons_week_published
  ON lessons (week_id, order_index)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_courses_price
  ON courses (price_etb)
  WHERE price_etb IS NOT NULL;

-- ============================================================================
-- 6. VERIFICATION — prints the new schema in the migration log
-- ============================================================================
--
-- Useful for confirming the migration applied cleanly in prod. If the
-- notice block is missing from the logs, the migration did not run.
--
DO $$
DECLARE
  course_price_exists BOOLEAN;
  phase_price_exists BOOLEAN;
  phase_published_exists BOOLEAN;
  week_published_exists BOOLEAN;
  lesson_published_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'courses' AND column_name = 'price_etb'
  ) INTO course_price_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'phases' AND column_name = 'price_etb'
  ) INTO phase_price_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'phases' AND column_name = 'is_published'
  ) INTO phase_published_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'weeks' AND column_name = 'is_published'
  ) INTO week_published_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'lessons' AND column_name = 'is_published'
  ) INTO lesson_published_exists;

  RAISE NOTICE '029 migration verification:';
  RAISE NOTICE '  courses.price_etb        = %', course_price_exists;
  RAISE NOTICE '  phases.price_etb         = %', phase_price_exists;
  RAISE NOTICE '  phases.is_published      = %', phase_published_exists;
  RAISE NOTICE '  weeks.is_published       = %', week_published_exists;
  RAISE NOTICE '  lessons.is_published     = %', lesson_published_exists;

  IF NOT (course_price_exists AND phase_price_exists
          AND phase_published_exists AND week_published_exists
          AND lesson_published_exists) THEN
    RAISE EXCEPTION 'Migration 029 incomplete — one or more columns missing.';
  END IF;
END $$;

COMMIT;