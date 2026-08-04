-- ============================================================================
-- Migration: Enrollment Access Control
-- Ensures the enrollments table has the correct schema for phase-level
-- access control (purchase_mode + selected_phases).
-- 
-- Idempotent: safe to run multiple times. Uses IF NOT EXISTS / IF EXISTS
-- to avoid errors on re-run.
--
-- Path: apps/api/src/database/migrations/003_enrollment_access_control.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Ensure purchase_mode column exists with correct constraints
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'enrollments' AND column_name = 'purchase_mode'
    ) THEN
        ALTER TABLE enrollments
        ADD COLUMN purchase_mode VARCHAR(20) DEFAULT 'full-course'
        CHECK (purchase_mode IN ('full-course', 'individual-phases'));
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Ensure selected_phases column exists (TEXT array for phase IDs)
--    NULL = full course (all phases accessible)
--    ARRAY['phase-1','phase-3'] = only those phases accessible
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'enrollments' AND column_name = 'selected_phases'
    ) THEN
        ALTER TABLE enrollments
        ADD COLUMN selected_phases TEXT[] DEFAULT NULL;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Ensure purchase_amount column exists
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'enrollments' AND column_name = 'purchase_amount'
    ) THEN
        ALTER TABLE enrollments
        ADD COLUMN purchase_amount DECIMAL(10,2) DEFAULT NULL;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Ensure payment_id foreign key exists
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'enrollments' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE enrollments
        ADD COLUMN payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Create indexes for performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_enrollments_purchase_mode
ON enrollments(purchase_mode);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id
ON enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at
ON enrollments(enrolled_at DESC);

-- ---------------------------------------------------------------------------
-- 6. Backfill: mark all existing enrolled users as full-course
--    Only updates rows where purchase_mode is still NULL
-- ---------------------------------------------------------------------------
UPDATE enrollments
SET purchase_mode = 'full-course'
WHERE purchase_mode IS NULL;

-- ---------------------------------------------------------------------------
-- 7. Ensure is_enrolled flag on users table is consistent
--    Users with an active enrollment should have is_enrolled = true
-- ---------------------------------------------------------------------------
UPDATE users
SET is_enrolled = true
WHERE id IN (
    SELECT DISTINCT user_id FROM enrollments
)
AND is_enrolled = false;

-- ---------------------------------------------------------------------------
-- 8. Clean up: users with is_enrolled = true but no enrollment record
--    This can happen from legacy data. Set them back to false.
-- ---------------------------------------------------------------------------
UPDATE users
SET is_enrolled = false
WHERE is_enrolled = true
AND id NOT IN (
    SELECT DISTINCT user_id FROM enrollments
);

COMMIT;