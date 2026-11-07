/**
 * Migration: 025_scholarship_refund_flow.sql
 *
 * Adds the refund workflow columns for the pay-at-apply scholarship model.
 *
 * When a scholarship application's registration fee is collected at
 * submission time and the application is later rejected, the fee must be
 * refunded to the applicant. Ethiopian payment rails (Telebirr, CBE Birr,
 * Bank Transfer) have no automated reversal API, so refunds are processed
 * manually by an admin and marked complete in this table.
 *
 * New columns on `scholarship_applications`:
 *   refund_status     — one of NULL, 'pending', 'completed', 'not_required'
 *   refund_amount_etb — the exact amount refunded (mirrors payment.amount)
 *   refund_requested_at     — when the application was rejected (refund queued)
 *   refund_processed_at     — when admin confirmed the manual transfer
 *   refund_processed_by     — FK to admins
 *   refund_note             — admin note (transaction ID, Telebirr receipt ref)
 *
 * New statuses on `payments.status`:
 *   'refund_pending'  — queued for manual refund
 *   'refunded'        — money returned to student
 *
 * Path: apps/api/src/database/migrations/025_scholarship_refund_flow.sql
 */

-- ============================================================================
-- 1. Add refund tracking columns to scholarship_applications
-- ============================================================================
ALTER TABLE scholarship_applications
  ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20)
    CHECK (refund_status IN ('pending', 'completed', 'not_required')),
  ADD COLUMN IF NOT EXISTS refund_amount_etb DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS refund_processed_by UUID REFERENCES admins(id),
  ADD COLUMN IF NOT EXISTS refund_note TEXT;

-- ============================================================================
-- 2. Widen payments.status to include the two new states
-- ============================================================================
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'refund_pending', 'refunded'));

-- ============================================================================
-- 3. Index pending refunds for the admin dashboard badge
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_refund_pending
  ON scholarship_applications(refund_status)
  WHERE refund_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_payments_refund_pending
  ON payments(status)
  WHERE status = 'refund_pending';

-- ============================================================================
-- 4. Backfill: existing approved scholarships get refund_status = 'not_required'
-- ============================================================================
UPDATE scholarship_applications
SET refund_status = 'not_required'
WHERE status = 'approved'
  AND refund_status IS NULL;