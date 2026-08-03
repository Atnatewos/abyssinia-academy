/**
 * Migration: Add Phase Enrollment Support
 * Adds purchase_mode and selected_phases columns to enrollments table
 * Path: apps/api/src/database/migrations/002_add_phase_enrollment.sql
 */

-- Add purchase mode column to track how the student bought the course
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS purchase_mode VARCHAR(20) DEFAULT 'full-course'
CHECK (purchase_mode IN ('full-course', 'individual-phases'));

-- Add selected phases column for individual phase purchases
-- NULL = full course purchase (all phases)
-- Array of phase IDs = specific phases purchased
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS selected_phases TEXT[] DEFAULT NULL;

-- Add purchase amount tracking
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS purchase_amount DECIMAL(10,2) DEFAULT NULL;

-- Add index for querying by purchase mode
CREATE INDEX IF NOT EXISTS idx_enrollments_purchase_mode ON enrollments(purchase_mode);

-- Add payment_id reference to link enrollment to payment
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;