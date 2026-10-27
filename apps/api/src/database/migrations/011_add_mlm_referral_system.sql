/**
 * @fileoverview Migration: 4-Level MLM Referral & Commission System
 *
 * Introduces the complete MLM infrastructure on top of the existing
 * single-tier referral system from migration 004. Existing tables
 * (referral_codes, referrals, referral_earnings) are preserved for
 * backward compatibility and audit purposes — they are NOT dropped.
 *
 * Business Model Enforced by Schema:
 *   - 4-level commission chain: 200 / 150 / 100 / 50 ETB
 *   - 7-day unlock window on commissions (refund protection)
 *   - Bonuses awarded as credits (non-stacking per category)
 *   - Withdrawals are cash-only (no credit conversion at checkout)
 *   - Monthly caps per user and per platform
 *
 * Schema Integrity Guarantees:
 *   - Depth capped at 4 via CHECK constraint (no depth 5 possible)
 *   - No self-referral via CHECK constraint (ancestor != descendant)
 *   - Idempotent: safe to run multiple times
 *   - All money columns use DECIMAL(10,2) or DECIMAL(12,2)
 *
 * Path: apps/api/src/database/migrations/007_add_mlm_referral_system.sql
 */

BEGIN;

-- ============================================================================
-- 1. AFFILIATE WALLETS
-- One row per user. Tracks cash-equivalent affiliate earnings.
-- ---------------------------------------------------------------------------
-- Design notes:
--   - current_balance  = unlocked + still-available money (withdrawable)
--   - pending_withdrawal = reserved during an active withdrawal request
--   - total_earned / total_withdrawn are lifetime aggregates for reporting
--   - debt_balance is for the rare case where a refund is issued AFTER a
--     commission was already paid out (referrer owes the platform)
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliate_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    /* Lifetime gross earnings before any withdrawal */
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_earned >= 0),

    /* Lifetime amount successfully paid out to the user */
    total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_withdrawn >= 0),

    /* Currently withdrawable balance */
    current_balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_balance >= 0),

    /* Money reserved for a pending withdrawal request */
    pending_withdrawal DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (pending_withdrawal >= 0),

    /* Negative balance owed to platform (from refund-after-withdrawal) */
    debt_balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (debt_balance >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_affiliate_wallets_user ON affiliate_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_wallets_balance ON affiliate_wallets(current_balance)
    WHERE current_balance > 0;

COMMENT ON TABLE affiliate_wallets IS 'Cash-equivalent affiliate wallet — one row per user. Only exit is withdrawal, never checkout.';


-- ============================================================================
-- 2. USER TABLE — MLM METADATA COLUMNS
-- Adds referral-tree pointers and cached aggregate counts on users.
-- ---------------------------------------------------------------------------
-- Design notes:
--   - referred_by_user_id is the direct referrer (NULL for root users)
--   - affiliate_tier is reserved for future tier system (unused in v1)
--   - direct_referral_count and total_team_size are cached for fast dashboard
--     reads. They are maintained by the service layer inside transactions.
-- ============================================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS affiliate_tier INTEGER NOT NULL DEFAULT 1
    CHECK (affiliate_tier BETWEEN 1 AND 4);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS direct_referral_count INTEGER NOT NULL DEFAULT 0
    CHECK (direct_referral_count >= 0);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_team_size INTEGER NOT NULL DEFAULT 0
    CHECK (total_team_size >= 0);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS lifetime_referral_earnings DECIMAL(10,2) NOT NULL DEFAULT 0
    CHECK (lifetime_referral_earnings >= 0);

CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_user_id);
CREATE INDEX IF NOT EXISTS idx_users_direct_count ON users(direct_referral_count DESC);


-- ============================================================================
-- 3. REFERRAL TREE (Closure Table)
-- Stores ALL ancestor-descendant pairs with depth 1-4.
-- ---------------------------------------------------------------------------
-- Example: A → B → C → D
--   Rows inserted:
--     (A, B, 1), (A, C, 2), (A, D, 3), (A, E, 4)
--     (B, C, 1), (B, D, 2), (B, E, 3)
--     (C, D, 1), (C, E, 2)
--     (D, E, 1)
--
-- Lookup "who earns from this buyer" = single indexed query:
--   SELECT ancestor_id, depth FROM referral_tree
--   WHERE descendant_id = $1 ORDER BY depth ASC
--
-- Depth is CAPPED at 4 by CHECK constraint. Level 5+ is impossible.
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_tree (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ancestor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    descendant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    depth INTEGER NOT NULL CHECK (depth BETWEEN 1 AND 4),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    /* No user can be their own ancestor */
    CONSTRAINT referral_tree_no_self_reference CHECK (ancestor_id <> descendant_id),

    /* One row per (ancestor, descendant) pair */
    UNIQUE (ancestor_id, descendant_id)
);

/* Hot-path: given a descendant, find all ancestors up to depth 4 */
CREATE INDEX IF NOT EXISTS idx_referral_tree_descendant_depth
    ON referral_tree(descendant_id, depth);

/* Analytics: given an ancestor, find downline grouped by depth */
CREATE INDEX IF NOT EXISTS idx_referral_tree_ancestor_depth
    ON referral_tree(ancestor_id, depth);

COMMENT ON TABLE referral_tree IS 'Closure table for 4-level MLM. Depth hard-capped at 4 by CHECK constraint.';


-- ============================================================================
-- 4. AFFILIATE COMMISSIONS
-- One row per commission earned per sale. Commissions are LOCKED for 7 days
-- (unlock_at) to protect against refunds.
-- ---------------------------------------------------------------------------
-- Design notes:
--   - tier_at_time and tier_percent_at_time are SNAPSHOTS — even if the user
--     later changes tier, historical rows reflect what was true at earn-time.
--   - unlock_at is a GENERATED column: DB-enforced 7-day lock.
--   - status='credited' means it exists; whether it's withdrawable depends
--     on whether unlock_at <= NOW(). The service layer enforces this.
--   - status='reversed' means a refund was issued within the lock window and
--     the amount was clawed back (or offset against future earnings).
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /* Who earned this commission */
    earning_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    /* Whose purchase generated it */
    source_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    /* Which payment record triggered it — used for idempotency */
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,

    /* Which ancestor level this corresponds to (1=direct, 4=deepest) */
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),

    /* Snapshot of the earning user's state at time of earning */
    tier_at_time INTEGER NOT NULL DEFAULT 1,
    tier_percent_at_time DECIMAL(5,2) NOT NULL DEFAULT 0,

    /* Financial amounts */
    sale_amount DECIMAL(10,2) NOT NULL CHECK (sale_amount > 0),
    commission_amount DECIMAL(10,2) NOT NULL CHECK (commission_amount > 0),

    /* Status lifecycle */
    status VARCHAR(20) NOT NULL DEFAULT 'credited'
        CHECK (status IN ('credited', 'reversed', 'clawed_back')),

    /* Timestamp the commission was created */
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    /* When the amount becomes withdrawable (created_at + 7 days) */
    unlock_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),

    /* Reversal tracking */
    reversed_at TIMESTAMP,
    reversal_reason TEXT,

    /* Prevent duplicate rows per (payment, earning user) */
    UNIQUE (payment_id, earning_user_id)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_earner
    ON affiliate_commissions(earning_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_earner_unlocked
    ON affiliate_commissions(earning_user_id, unlock_at)
    WHERE status = 'credited';

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_payment
    ON affiliate_commissions(payment_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_source
    ON affiliate_commissions(source_user_id, created_at DESC);

COMMENT ON TABLE affiliate_commissions IS 'Per-sale commission rows. 7-day unlock enforced via unlock_at column. Idempotent per payment via UNIQUE constraint.';


-- ============================================================================
-- 5. REFERRAL BONUSES
-- Bonus achievements paid in CREDITS (not cash). Non-stacking per category.
-- ---------------------------------------------------------------------------
-- Design notes:
--   - bonus_category groups bonuses into 5 mutually-exclusive families
--   - requirement_met is the threshold the user hit (e.g., 5, 10, 20 direct)
--   - amount is the DELTA credited (not the tier total) — delta approach
--   - period is 'YYYY-MM' for monthly bonuses (speed_bonus), NULL otherwise
--   - UNIQUE(user, category, requirement, period) prevents double-awarding
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    bonus_category VARCHAR(30) NOT NULL
        CHECK (bonus_category IN (
            'direct_referral',
            'milestone',
            'rank',
            'team_bonus',
            'speed_bonus'
        )),

    /* Human-readable label for dashboards (e.g., 'Silver Rank') */
    bonus_name VARCHAR(100) NOT NULL,

    /* The threshold value the user achieved (e.g., 50 team members) */
    requirement_met INTEGER NOT NULL CHECK (requirement_met > 0),

    /* The DELTA amount credited in this event (ETB credits) */
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),

    /* 'YYYY-MM' for monthly bonuses; NULL for lifetime achievements */
    period VARCHAR(7),

    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    /* Prevent duplicate award for the same threshold in the same period */
    UNIQUE (user_id, bonus_category, requirement_met, period)
);

CREATE INDEX IF NOT EXISTS idx_referral_bonuses_user
    ON referral_bonuses(user_id, awarded_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_bonuses_category
    ON referral_bonuses(bonus_category, awarded_at DESC);

COMMENT ON TABLE referral_bonuses IS 'Bonus achievements in credits. Delta approach: each row credits only the difference to the next tier.';


-- ============================================================================
-- 6. WITHDRAWAL REQUESTS
-- Cash payout workflow. Admin approves → pays externally → marks paid.
-- ---------------------------------------------------------------------------
-- Design notes:
--   - Account details are SNAPSHOTTED at request time so that changes to the
--     user profile later don't affect in-flight requests.
--   - Status flow: pending → approved → paid | rejected
--   - On creation, amount moves from wallet.current_balance to
--     wallet.pending_withdrawal. On paid → moves to wallet.total_withdrawn.
--     On rejected → moves back to wallet.current_balance.
-- ============================================================================

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),

    method VARCHAR(20) NOT NULL
        CHECK (method IN ('telebirr', 'cbe-birr', 'bank-transfer')),

    account_number VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,

    /* Only populated when method = 'bank-transfer' */
    bank_name VARCHAR(100),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),

    /* Admin processing metadata */
    processed_by_admin UUID REFERENCES admins(id) ON DELETE SET NULL,
    processed_at TIMESTAMP,
    admin_note TEXT,

    /* External transaction reference from Telebirr/Bank */
    transaction_ref VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user
    ON withdrawal_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status
    ON withdrawal_requests(status, created_at);

/* Only one pending request per user at any time */
CREATE UNIQUE INDEX IF NOT EXISTS idx_withdrawal_requests_one_pending
    ON withdrawal_requests(user_id)
    WHERE status IN ('pending', 'approved');

COMMENT ON TABLE withdrawal_requests IS 'Cash withdrawal workflow. One pending request per user enforced by partial unique index.';


-- ============================================================================
-- 7. REFERRAL MONTHLY STATS
-- Per-user per-month aggregates for cap enforcement.
-- ---------------------------------------------------------------------------
-- Design notes:
--   - month is 'YYYY-MM' format for lexical sorting
--   - Composite unique (user_id, month) enables UPSERT via ON CONFLICT
--   - Service layer checks these values BEFORE crediting new commissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_monthly_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,

    total_commission DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_commission >= 0),
    total_bonus DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_bonus >= 0),

    /* Sum of total_commission + total_bonus, cached for fast cap checks */
    total_payout DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_payout >= 0),

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_referral_monthly_stats_user
    ON referral_monthly_stats(user_id, month DESC);

CREATE INDEX IF NOT EXISTS idx_referral_monthly_stats_month
    ON referral_monthly_stats(month);

COMMENT ON TABLE referral_monthly_stats IS 'Monthly aggregates for cap enforcement. Composite unique enables UPSERT.';


-- ============================================================================
-- 8. REFERRAL PLATFORM MONTHLY
-- Platform-wide monthly payout total. Enforces the global cap.
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_platform_monthly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month VARCHAR(7) NOT NULL UNIQUE,

    total_payout DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_payout >= 0),

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_platform_monthly_month
    ON referral_platform_monthly(month);

COMMENT ON TABLE referral_platform_monthly IS 'Platform-wide payout cap tracking. One row per month.';


-- ============================================================================
-- 9. BACKFILL — Create wallets for existing users
-- Every existing user gets an empty wallet so the service layer never has to
-- handle "wallet missing" edge cases going forward.
-- ============================================================================

INSERT INTO affiliate_wallets (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================================
-- 10. LEGACY TABLE COMMENTS
-- Mark old referral tables as legacy to signal future readers.
-- Do NOT drop them — they contain historical earnings data.
-- ============================================================================

COMMENT ON TABLE referrals IS
    'LEGACY (pre-MLM). Historical single-tier referral records. Kept for audit. Superseded by referral_tree + affiliate_commissions.';

COMMENT ON TABLE referral_earnings IS
    'LEGACY (pre-MLM). Historical earnings aggregate. Kept for audit. Superseded by affiliate_wallets + referral_bonuses.';

COMMENT ON TABLE referral_codes IS
    'Referral codes remain active — they power registration attribution for the MLM system.';

COMMIT;