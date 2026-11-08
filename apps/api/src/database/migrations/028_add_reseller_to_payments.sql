-- ============================================================================
-- Migration: 028_add_reseller_to_payments.sql
--
-- Extends the payments table to record reseller attribution at checkout time.
-- This is the single source of truth for "which reseller drove this payment"
-- and "what was the retail price and split at the moment of payment."
--
-- These columns are populated at payment submission and read at approval
-- time (by the orchestrator) to determine the correct commission route.
--
-- Path: apps/api/src/database/migrations/028_add_reseller_to_payments.sql
-- ============================================================================

BEGIN;

-- ── Reseller attribution columns ────────────────────────────────────────────
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS reseller_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS parent_reseller_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reseller_retail_price DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS platform_fee_amount DECIMAL(10,2);

-- ── Fast lookups for admin panel and analytics ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_reseller
    ON payments(reseller_user_id, created_at DESC)
    WHERE reseller_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_parent_reseller
    ON payments(parent_reseller_user_id, created_at DESC)
    WHERE parent_reseller_user_id IS NOT NULL;

-- ── Documentation ───────────────────────────────────────────────────────────
COMMENT ON COLUMN payments.reseller_user_id IS
    'The reseller whose code was used at checkout. NULL for direct or MLM purchases.';
COMMENT ON COLUMN payments.parent_reseller_user_id IS
    'The parent of the reseller at time of sale (for parent bonus distribution). NULL if reseller had no parent.';
COMMENT ON COLUMN payments.reseller_retail_price IS
    'The price the buyer paid (may differ from base price due to agent-set pricing).';
COMMENT ON COLUMN payments.platform_fee_amount IS
    'The platform fee collected on this payment, snapshotted at sale time.';

COMMIT;