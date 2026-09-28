-- ============================================================================
-- Migration: 012_money_model_v2.sql
--
-- Purpose:
--   Transitions the MLM money model from "credits + commissions" (dual concept)
--   to a single-wallet contract with unified locks and paying-gated bonuses.
--
-- Key changes:
--   1. Users table gains `paying_direct_count` and `paying_team_size` counters.
--      These track referrals who have made at least one approved payment.
--      Bonuses are now computed against these counters (not registration-based
--      counters), preventing registration-farm abuse.
--
--   2. referral_bonuses table gains:
--      - `unlock_at`  : timestamp when the bonus becomes withdrawable
--                      (default: awarded_at + 7 days from config)
--      - `status`     : 'credited' | 'reversed' (supports clawback)
--      - `reversed_at`: when the bonus was clawed back (NULL if not reversed)
--      - `reversal_reason`: audit trail text for why the bonus was reversed
--
--   3. New indexes on referral_bonuses for fast lookups:
--      - (user_id, status, unlock_at) for withdrawable/locked queries
--      - (user_id, bonus_category, period, requirement_met DESC) for delta math
--
--   4. Backfill: existing bonus rows get unlock_at = awarded_at + 7 days.
--      In production this is typically a small dataset; in staging we've seeded
--      bonus rows that also need to be aligned with the new schema.
--
--   5. Deprecation marker: payments.credit_applied column is retained for
--      historical audit but should no longer be read or written by new code.
--      The single-wallet contract replaces credit semantics entirely.
--
-- Idempotency:
--   - All column additions use IF NOT EXISTS patterns via DO blocks
--   - Index creations use IF NOT EXISTS directly
--   - Backfill UPDATE is a no-op on rows that already have unlock_at set
--   - Safe to run multiple times against any environment
--
-- Rollback:
--   This migration is logically reversible but intentionally not rolled back
--   in normal operations. If needed, drop the new columns and indexes.
--
-- Path: apps/api/src/database/migrations/012_money_model_v2.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: Users table — paying-referral counters
-- ============================================================================
--
-- These counters increment on every APPROVED payment made by a descendant:
--   - paying_direct_count: depth-1 descendants who have paid at least once
--   - paying_team_size: all ≤4-depth descendants who have paid at least once
--
-- Structural counters (direct_referral_count, total_team_size) are preserved
-- for tree-display purposes and commission eligibility. They still increment
-- on registration. Only bonus computation uses the paying counters.
--

DO $$
BEGIN
  -- Add paying_direct_count if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'paying_direct_count'
  ) THEN
    ALTER TABLE users
      ADD COLUMN paying_direct_count INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added users.paying_direct_count';
  ELSE
    RAISE NOTICE 'users.paying_direct_count already exists';
  END IF;

  -- Add paying_team_size if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'paying_team_size'
  ) THEN
    ALTER TABLE users
      ADD COLUMN paying_team_size INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added users.paying_team_size';
  ELSE
    RAISE NOTICE 'users.paying_team_size already exists';
  END IF;
END $$;

-- Check constraints prevent negative counts
-- (defensive, in case application bugs ever push values below zero)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_paying_direct_count_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_paying_direct_count_check
      CHECK (paying_direct_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_paying_team_size_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_paying_team_size_check
      CHECK (paying_team_size >= 0);
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: referral_bonuses table — lock, status, and clawback fields
-- ============================================================================
--
-- Each bonus row now has a lifecycle:
--   1. CREATED (awarded_at set)       — bonus earned, locked for 7 days
--   2. UNLOCKED (unlock_at <= NOW())  — funds withdrawable via requestWithdrawal
--   3. REVERSED (status='reversed')   — clawed back (triggering purchase refunded
--                                       while bonus was still locked)
--
-- The unlock_at field is NOT a generated column (unlike affiliate_commissions.unlock_at
-- which derives from created_at + interval). We use an explicit column because:
--   - awarded_at may be back-dated by admin action
--   - bonus lock windows may differ from commission lock windows in the future
--   - explicit control is clearer for audit purposes
--

DO $$
BEGIN
  -- Add unlock_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_bonuses' AND column_name = 'unlock_at'
  ) THEN
    ALTER TABLE referral_bonuses
      ADD COLUMN unlock_at TIMESTAMPTZ;
    RAISE NOTICE 'Added referral_bonuses.unlock_at';
  ELSE
    RAISE NOTICE 'referral_bonuses.unlock_at already exists';
  END IF;

  -- Add status column (defaults to 'credited' for existing rows)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_bonuses' AND column_name = 'status'
  ) THEN
    ALTER TABLE referral_bonuses
      ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'credited';
    RAISE NOTICE 'Added referral_bonuses.status';
  ELSE
    RAISE NOTICE 'referral_bonuses.status already exists';
  END IF;

  -- Add reversed_at for clawback audit trail
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_bonuses' AND column_name = 'reversed_at'
  ) THEN
    ALTER TABLE referral_bonuses
      ADD COLUMN reversed_at TIMESTAMPTZ;
    RAISE NOTICE 'Added referral_bonuses.reversed_at';
  ELSE
    RAISE NOTICE 'referral_bonuses.reversed_at already exists';
  END IF;

  -- Add reversal_reason for human-readable audit trail
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_bonuses' AND column_name = 'reversal_reason'
  ) THEN
    ALTER TABLE referral_bonuses
      ADD COLUMN reversal_reason TEXT;
    RAISE NOTICE 'Added referral_bonuses.reversal_reason';
  ELSE
    RAISE NOTICE 'referral_bonuses.reversal_reason already exists';
  END IF;
END $$;

-- Status enum constraint: only these values are legal
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'referral_bonuses_status_check'
  ) THEN
    ALTER TABLE referral_bonuses
      ADD CONSTRAINT referral_bonuses_status_check
      CHECK (status IN ('credited', 'reversed'));
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: Indexes for performance
-- ============================================================================
--
-- These indexes serve specific query patterns the application will run:
--
-- 1. referral_bonuses_unlock_idx:
--    Used by getWithdrawableBalance() to sum bonuses where
--    unlock_at <= NOW() AND status = 'credited' for a given user.
--    Covering index includes amount so the query is index-only.
--
-- 2. referral_bonuses_delta_lookup_idx:
--    Used by awardEligibleBonuses() to find the highest awarded
--    bonus in a (category, period) pair for the delta calculation.
--    requirement_met DESC puts the highest threshold at the top of the
--    index scan, making LIMIT 1 an index-only scan.
--
-- 3. users_paying_counters_idx:
--    Used by admin analytics queries to list top-performing referrers
--    by paying-direct count (marketing reports, leaderboard, etc.)
--

CREATE INDEX IF NOT EXISTS referral_bonuses_unlock_idx
  ON referral_bonuses (user_id, status, unlock_at)
  INCLUDE (amount);

CREATE INDEX IF NOT EXISTS referral_bonuses_delta_lookup_idx
  ON referral_bonuses (user_id, bonus_category, period, requirement_met DESC);

CREATE INDEX IF NOT EXISTS users_paying_counters_idx
  ON users (paying_direct_count DESC, paying_team_size DESC);

-- ============================================================================
-- SECTION 4: Backfill existing bonus rows with unlock_at
-- ============================================================================
--
-- Pre-existing bonus rows (seeded by the test harness, or created in
-- earlier iterations before this migration) have NULL unlock_at.
-- We backfill them as if they were awarded on awarded_at with a 7-day
-- lock (matching the config-driven unlockDelayDays default).
--
-- The UPDATE is a no-op on rows that already have unlock_at set,
-- so re-running the migration is safe.
--

UPDATE referral_bonuses
SET unlock_at = awarded_at + INTERVAL '7 days'
WHERE unlock_at IS NULL;

-- ============================================================================
-- SECTION 5: Backfill paying counters from actual payment data
-- ============================================================================
--
-- For users who have already registered and whose descendants have
-- already made approved payments BEFORE this migration, we compute
-- their current paying counters from the referral_tree + payments join.
--
-- This ensures the admin panel and dashboard show accurate data
-- immediately after migration, without requiring every user to trigger
-- a new payment to "wake up" their counters.
--
-- paying_direct_count: number of depth-1 descendants with at least one approved payment
-- paying_team_size: number of depth-2..4 descendants with at least one approved payment
--
-- We use a single UPDATE with a subquery rather than separate UPDATEs
-- for efficiency and to keep the operation atomic.
--

UPDATE users u
SET
  paying_direct_count = COALESCE(sub.paying_direct, 0),
  paying_team_size = COALESCE(sub.paying_team, 0)
FROM (
  SELECT
    rt.ancestor_id AS user_id,
    COUNT(*) FILTER (WHERE rt.depth = 1) AS paying_direct,
    COUNT(*) FILTER (WHERE rt.depth > 1 AND rt.depth <= 4) AS paying_team
  FROM referral_tree rt
  JOIN payments p
    ON p.user_id = rt.descendant_id
   AND p.status = 'approved'
  GROUP BY rt.ancestor_id
) AS sub
WHERE u.id = sub.user_id;

-- ============================================================================
-- SECTION 6: Deprecation + documentation comments
-- ============================================================================
--
-- All COMMENT ON statements use $$ dollar-quoting so the comment text can
-- contain single quotes, parentheses, and punctuation without escaping.
--
-- payments.credit_applied is retained for historical audit. New code must
-- NOT reference it — the single-wallet contract replaces credit semantics.
--

COMMENT ON COLUMN payments.credit_applied IS $$
DEPRECATED (Money Model v2): Retained for legacy audit only.
The single-wallet contract replaces credit semantics — all earnings
flow through commissions and bonuses, both landing in current_balance.
$$;

COMMENT ON COLUMN users.paying_direct_count IS $$
Money Model v2: Number of depth-1 descendants who have made at least one
approved payment. Used for bonus eligibility (paying-gated). Structural
counter direct_referral_count increments on registration and is used for
tree display.
$$;

COMMENT ON COLUMN users.paying_team_size IS $$
Money Model v2: Number of depth-2..4 descendants who have made at least one
approved payment. Used for milestone/rank/team bonuses. Structural counter
total_team_size increments on registration.
$$;

COMMENT ON COLUMN referral_bonuses.unlock_at IS $$
Timestamp when this bonus becomes withdrawable. Default: awarded_at + 7 days
(configured via referrals.commissionStructure.unlockDelayDays). Funds are
locked until unlock_at; withdrawal validation uses getWithdrawableBalance().
$$;

COMMENT ON COLUMN referral_bonuses.status IS $$
Bonus lifecycle state: credited (active) or reversed (clawed back).
Reversal happens only while locked (unlock_at > NOW) and only when a
triggering payment is refunded within the lock window.
$$;

COMMENT ON COLUMN referral_bonuses.reversed_at IS $$
Timestamp when the bonus was clawed back. NULL if still credited.
Used for audit logs and admin clawback visibility.
$$;

COMMENT ON COLUMN referral_bonuses.reversal_reason IS $$
Human-readable explanation for the clawback. Typical values:
'Triggering payment refunded within lock window'
'Admin manual reversal (case #12345)'
etc.
$$;

COMMIT;