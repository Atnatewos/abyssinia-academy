-- ============================================================================
-- Migration: 031_scholarship_fee_model_a.sql
--
-- Enables the "pay at apply" fee model for scholarship campaigns. Under
-- this model:
--
--   1. Applicants submit the registration-fee payment proof at the moment
--      they submit their application. The `scholarship_applications` and
--      `payments` rows land in the same transaction (already implemented
--      in the service layer).
--
--   2. Admin verification is an explicit two-step flow:
--        pending --[admin verify payment]--> payment_verified
--        payment_verified --[admin approve]--> approved
--
--   3. `pending_payment` is retired: the fee is collected at apply time,
--      so there is no separate "waiting for the applicant to pay" state.
--      Legacy applications still in `pending_payment` are transitioned to
--      `pending` so they enter the new verification flow.
--
--   4. A `payments` row can never exist twice for the same scholarship
--      application. A partial unique index enforces this at the DB level.
--
-- Idempotency: every statement is guarded with IF NOT EXISTS or a DO block
-- so the migration is safe to run repeatedly.
--
-- Path: apps/api/src/database/migrations/031_scholarship_fee_model_a.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. EXPAND THE APPLICATION STATUS LATTICE
-- ============================================================================
-- The old CHECK constraint enforced a fixed list including 'pending_payment'.
-- We drop it and re-add an expanded list that:
--   - keeps 'pending_payment' for legacy rows (never re-entered for new rows,
--     but still needed so the transition-backfill below can be idempotent)
--   - adds 'payment_verified' as the new pre-approval state

ALTER TABLE scholarship_applications
  DROP CONSTRAINT IF EXISTS scholarship_applications_status_check;

ALTER TABLE scholarship_applications
  ADD CONSTRAINT scholarship_applications_status_check
  CHECK (status IN (
    'pending',
    'pending_payment',
    'payment_verified',
    'approved',
    'rejected',
    'withdrawn',
    'revoked'
  ));

-- ============================================================================
-- 2. BACKFILL LEGACY pending_payment ROWS
-- ============================================================================
-- Existing rows in 'pending_payment' mean the applicant has not yet paid
-- (Model B legacy). Because Model A requires payment proof at submission,
-- these rows must be resolved before the new flow can take over:
--
--   - If the linked payments row is already 'approved', the admin has
--     verified the money → move to 'payment_verified' so it enters the
--     approval queue.
--   - Otherwise the money never arrived → move to 'pending' so the admin
--     can reject-and-refund it (or verify it if proof appears).
--
-- Both updates are conditional so re-running is a no-op.

UPDATE scholarship_applications a
SET status = 'payment_verified',
    updated_at = CURRENT_TIMESTAMP
WHERE a.status = 'pending_payment'
  AND EXISTS (
    SELECT 1 FROM payments p
    WHERE p.scholarship_application_id = a.id
      AND p.purpose = 'scholarship_registration'
      AND p.status = 'approved'
  );

UPDATE scholarship_applications a
SET status = 'pending',
    updated_at = CURRENT_TIMESTAMP
WHERE a.status = 'pending_payment';

-- ============================================================================
-- 3. PREVENT MULTIPLE REGISTRATION-FEE PAYMENTS PER APPLICATION
-- ============================================================================
-- Model A guarantees exactly one registration-fee payment row per
-- application. A partial unique index makes a second insert impossible at
-- the DB level, which double-protects the service-layer idempotency check
-- against race conditions.

CREATE UNIQUE INDEX IF NOT EXISTS uniq_scholarship_registration_payment
  ON payments (scholarship_application_id)
  WHERE purpose = 'scholarship_registration'
    AND scholarship_application_id IS NOT NULL;

-- ============================================================================
-- 4. SUPPORTING INDEXES FOR THE NEW FLOW
-- ============================================================================
-- Fast lookup of applications awaiting payment verification — the primary
-- admin work queue under Model A.

CREATE INDEX IF NOT EXISTS idx_scholarship_apps_pending_verify
  ON scholarship_applications (created_at ASC)
  WHERE status = 'pending';

-- Fast lookup of verified applications awaiting an approval decision.

CREATE INDEX IF NOT EXISTS idx_scholarship_apps_awaiting_decision
  ON scholarship_applications (created_at ASC)
  WHERE status = 'payment_verified';

-- Fast lookup for the refund queue (rejected applications with a pending
-- refund, ordered oldest-first so overdue items surface first).

CREATE INDEX IF NOT EXISTS idx_scholarship_apps_refund_queue
  ON scholarship_applications (refund_requested_at ASC)
  WHERE refund_status = 'pending';

COMMIT;

-- ============================================================================
-- VERIFICATION (run manually after migration)
-- ============================================================================
--
--   -- No rows should remain in pending_payment
--   SELECT COUNT(*) FROM scholarship_applications WHERE status = 'pending_payment';
--
--   -- The new partial unique index must exist
--   SELECT indexname FROM pg_indexes
--     WHERE tablename = 'payments'
--       AND indexname = 'uniq_scholarship_registration_payment';
--
--   -- The new status CHECK must accept 'payment_verified'
--   SELECT pg_get_constraintdef(oid) FROM pg_constraint
--     WHERE conname = 'scholarship_applications_status_check';
-- ============================================================================