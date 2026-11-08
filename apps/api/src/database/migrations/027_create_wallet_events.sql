-- ============================================================================
-- Migration: 027_create_wallet_events.sql
--
-- Introduces the wallet_events ledger — an append-only audit trail of every
-- monetary movement in the system.
--
-- Design principles:
--   - Append-only: rows are NEVER updated or deleted
--   - Self-contained: every event has enough context to be understood alone
--   - Balance-tracking: balance_after enables point-in-time reconstruction
--
-- Path: apps/api/src/database/migrations/027_create_wallet_events.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS wallet_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    event_type VARCHAR(40) NOT NULL CHECK (event_type IN (
        'reseller_sub_sale',
        'reseller_parent_bonus',
        'mlm_commission',
        'referral_bonus',
        'withdrawal',
        'withdrawal_reversal',
        'reversal',
        'admin_adjustment'
    )),

    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,

    reference_type VARCHAR(30),
    reference_id UUID,
    metadata JSONB,
    triggered_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_events_user
    ON wallet_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_events_reference
    ON wallet_events(reference_type, reference_id)
    WHERE reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wallet_events_type
    ON wallet_events(event_type, created_at DESC);

COMMENT ON TABLE wallet_events IS
    'Append-only ledger of every wallet movement. Never UPDATE or DELETE rows.';
COMMENT ON COLUMN wallet_events.amount IS
    'Signed: positive = credit to wallet, negative = debit from wallet.';
COMMENT ON COLUMN wallet_events.balance_after IS
    'Wallet current_balance immediately after this event, for point-in-time reconstruction.';

COMMIT;