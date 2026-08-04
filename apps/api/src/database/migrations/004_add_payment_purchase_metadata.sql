-- ============================================================================
-- Migration: Add Purchase Metadata to Payments Table
-- Stores purchase_mode and selected_phases on the payment record so the
-- approval endpoint knows exactly what the student bought.
--
-- Path: apps/api/src/database/migrations/004_add_payment_purchase_metadata.sql
-- ============================================================================

BEGIN;

-- Add purchase_mode column to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS purchase_mode VARCHAR(20) DEFAULT 'full-course'
CHECK (purchase_mode IN ('full-course', 'individual-phases'));

-- Add selected_phases column for individual phase purchases
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS selected_phases TEXT[] DEFAULT NULL;

-- Backfill: set all existing approved/rejected payments to full-course
-- since they were created before individual phases existed
UPDATE payments
SET purchase_mode = 'full-course'
WHERE purchase_mode IS NULL;

COMMIT;