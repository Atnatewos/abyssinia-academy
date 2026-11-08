-- ============================================================================
-- Migration: 026_create_reseller_system.sql
--
-- Introduces the Reseller System — a one-level sub-reseller program where
-- every registered user can set their own price for the course and earn
-- a configurable share of the reseller pool (default 70%).
--
-- Business model enforced by schema:
--   - Every user gets a reseller_profile automatically (via backfill + trigger)
--   - Each reseller can recruit AT MOST ONE level of sub-resellers
--     (enforced by app logic; schema supports any depth for future flexibility)
--   - Parent decides the sub-reseller's share percent within configured bounds
--   - All monetary values use DECIMAL(10,2) for financial precision
--
-- Design principles:
--   - Idempotent: safe to run multiple times
--   - Non-destructive: no DROP, no data loss
--   - Self-documenting: every column has a COMMENT explaining its purpose
--   - Audit-ready: timestamps + actor tracking on all mutable fields
--
-- Path: apps/api/src/database/migrations/026_create_reseller_system.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. RESELLER PROFILES
-- ============================================================================
-- One row per user who is a reseller. Every registered user gets a row
-- automatically (via backfill script + registration hook).
--
-- The `parent_reseller_id` FK enables one-level sub-reselling. A NULL value
-- means the reseller is a top-level reseller (no parent). A non-NULL value
-- means the reseller was recruited by another reseller.
--
-- The `sub_share_percent` column stores the percentage of the reseller pool
-- that THIS reseller receives on a sale. When this reseller has a parent,
-- that parent SET this value (within config bounds). When this reseller has
-- no parent, this value is still used for their own accounting (100% of pool).

CREATE TABLE IF NOT EXISTS reseller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /* The user who owns this reseller profile */
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    /* Public reseller code used in URLs (?res=RES-XXXX) */
    reseller_code VARCHAR(12) UNIQUE NOT NULL,

    /*
     * Parent reseller (if any). NULL for top-level resellers.
     * A reseller can only be recruited ONCE, so this is set at most once.
     * App logic enforces the depth cap (max_depth from config).
     */
    parent_reseller_id UUID REFERENCES reseller_profiles(id) ON DELETE SET NULL,

    /*
     * Depth in the reseller tree. 0 = top-level, 1 = sub-reseller.
     * The config file sets the maximum allowed depth (default 1).
     * Stored explicitly for fast queries and audit.
     */
    depth INTEGER NOT NULL DEFAULT 0 CHECK (depth >= 0),

    /*
     * Custom price this reseller charges their customers.
     * Must be within [minRetailPriceETB, maxRetailPriceETB] from config.
     * Enforced at write time by the price-validator module.
     */
    custom_price DECIMAL(10,2) NOT NULL DEFAULT 1000 CHECK (custom_price >= 0),

    /*
     * The percentage of the reseller pool that THIS reseller receives on a sale.
     * When this reseller has no parent, they keep 100% of the pool.
     * When they have a parent, this value (set by parent, within config bounds)
     * determines their share. The parent gets the remainder.
     *
     * Example: pool = 70%, sub_share_percent = 40.
     *   → this reseller gets 40% of pool = 28% of sale
     *   → parent gets 60% of pool = 42% of sale
     */
    sub_share_percent DECIMAL(5,2) NOT NULL DEFAULT 100
        CHECK (sub_share_percent >= 0 AND sub_share_percent <= 100),

    /*
     * Audit: who set the sub_share_percent and when.
     * NULL means the default was applied (no parent, or parent chose default).
     */
    sub_share_set_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sub_share_set_at TIMESTAMP,

    /* Storefront display fields (optional; used by public storefront page) */
    display_name VARCHAR(100),
    bio TEXT,
    profile_image_url TEXT,

    /* Lifecycle status */
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'pending_tos', 'inactive')),

    /* Terms of Service acceptance tracking */
    terms_accepted_at TIMESTAMP,
    terms_version VARCHAR(20),

    /* Activity tracking for anti-fraud and re-engagement */
    last_sale_at TIMESTAMP,
    last_login_at TIMESTAMP,

    /* Standard audit timestamps */
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    /* Prevent a reseller from being their own parent */
    CONSTRAINT reseller_profiles_no_self_parent
        CHECK (parent_reseller_id IS NULL OR parent_reseller_id <> id)
);

/* Fast lookup of sub-resellers for a parent */
CREATE INDEX IF NOT EXISTS idx_reseller_profiles_parent
    ON reseller_profiles(parent_reseller_id)
    WHERE parent_reseller_id IS NOT NULL;

/* Fast reseller code resolution at checkout */
CREATE INDEX IF NOT EXISTS idx_reseller_profiles_code
    ON reseller_profiles(reseller_code);

/* Fast active reseller listing */
CREATE INDEX IF NOT EXISTS idx_reseller_profiles_status
    ON reseller_profiles(status)
    WHERE status = 'active';

/* Fast depth-based queries for tree visualization and analytics */
CREATE INDEX IF NOT EXISTS idx_reseller_profiles_depth
    ON reseller_profiles(depth);

COMMENT ON TABLE reseller_profiles IS
    'Reseller profiles. One per user. Enables agent-set pricing and one-level sub-reselling.';
COMMENT ON COLUMN reseller_profiles.parent_reseller_id IS
    'The reseller who recruited this one. NULL for top-level resellers.';
COMMENT ON COLUMN reseller_profiles.depth IS
    'Distance from the top-level reseller. 0 = top-level, 1 = sub-reseller.';
COMMENT ON COLUMN reseller_profiles.custom_price IS
    'The price this reseller charges customers. Validated against config bounds at write time.';
COMMENT ON COLUMN reseller_profiles.sub_share_percent IS
    'Percentage of the reseller pool this reseller receives on a sale. Set by their parent.';
COMMENT ON COLUMN reseller_profiles.sub_share_set_by IS
    'The user who set the sub_share_percent (the parent reseller, or NULL for default).';


-- ============================================================================
-- 2. RESELLER SALES
-- ============================================================================
-- One row per successful sale. Records the exact split at the time of sale
-- so that later config or price changes do NOT retroactively affect past sales.
--
-- All monetary values are snapshots from the moment of sale. The `unlock_at`
-- column enforces the 7-day fraud protection window before funds become
-- withdrawable.

CREATE TABLE IF NOT EXISTS reseller_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /* The reseller who made this sale */
    reseller_id UUID NOT NULL REFERENCES reseller_profiles(id) ON DELETE RESTRICT,

    /* The buyer who purchased */
    buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    /* The payment record that triggered this sale */
    payment_id UUID NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,

    /* ── Price snapshot ────────────────────────────────────────────────── */
    retail_price DECIMAL(10,2) NOT NULL CHECK (retail_price > 0),

    /* ── Split snapshot ────────────────────────────────────────────────── */
    platform_fee_percent DECIMAL(5,2) NOT NULL
        CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),
    platform_fee_amount DECIMAL(10,2) NOT NULL CHECK (platform_fee_amount >= 0),
    reseller_pool_amount DECIMAL(10,2) NOT NULL CHECK (reseller_pool_amount >= 0),

    /* ── Sub-reseller involvement snapshot ─────────────────────────────── */
    /*
     * The parent reseller who earns from this sale (if any).
     * Snapshotted at sale time so that if the reseller is later orphaned,
     * the historical payout remains accurate.
     */
    parent_reseller_id UUID REFERENCES reseller_profiles(id) ON DELETE SET NULL,

    /* The sub_share_percent that was applied at sale time */
    sub_share_percent_snapshot DECIMAL(5,2) NOT NULL
        CHECK (sub_share_percent_snapshot >= 0 AND sub_share_percent_snapshot <= 100),

    /* ── Computed payouts ──────────────────────────────────────────────── */
    sub_reseller_payout DECIMAL(10,2) NOT NULL CHECK (sub_reseller_payout >= 0),
    parent_reseller_payout DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (parent_reseller_payout >= 0),

    /* ── Lifecycle ─────────────────────────────────────────────────────── */
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'paid', 'refunded', 'disputed', 'reversed')),

    /* ── Lock window ────────────────────────────────────────────────────── */
    /*
     * Funds become withdrawable after this timestamp.
     * Set to created_at + lockDays (from config) at sale creation.
     * Default is 7 days.
     */
    unlock_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),

    /* ── Audit timestamps ──────────────────────────────────────────────── */
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    reversal_reason TEXT
);

/* Reseller's own sales history */
CREATE INDEX IF NOT EXISTS idx_reseller_sales_reseller
    ON reseller_sales(reseller_id, created_at DESC);

/* Parent's team sales (for parent dashboard) */
CREATE INDEX IF NOT EXISTS idx_reseller_sales_parent
    ON reseller_sales(parent_reseller_id, created_at DESC)
    WHERE parent_reseller_id IS NOT NULL;

/* Buyer history (for support and fraud detection) */
CREATE INDEX IF NOT EXISTS idx_reseller_sales_buyer
    ON reseller_sales(buyer_user_id, created_at DESC);

/* Status-based filtering (admin panel) */
CREATE INDEX IF NOT EXISTS idx_reseller_sales_status
    ON reseller_sales(status, created_at DESC);

/* Unlock-at queries (for withdrawal balance calculation) */
CREATE INDEX IF NOT EXISTS idx_reseller_sales_unlock
    ON reseller_sales(reseller_id, unlock_at)
    WHERE status = 'approved';

COMMENT ON TABLE reseller_sales IS
    'One row per successful reseller sale. Contains price + split snapshots for historical accuracy.';
COMMENT ON COLUMN reseller_sales.retail_price IS
    'The price the buyer actually paid. Snapshotted at sale time.';
COMMENT ON COLUMN reseller_sales.sub_share_percent_snapshot IS
    'The sub_share_percent at the time of sale. Does not change if the parent later adjusts it.';
COMMENT ON COLUMN reseller_sales.unlock_at IS
    'Funds become withdrawable at this timestamp (7-day fraud protection by default).';


-- ============================================================================
-- 3. CONFIG OVERRIDES
-- ============================================================================
-- Per-reseller config overrides. Allows admins to customize pricing bounds,
-- commission splits, or other parameters for individual resellers.
--
-- A NULL value in any override column means "use the global config value".
-- This enables partial overrides: e.g., you can override just the price
-- ceiling for one reseller without touching the platform fee.

CREATE TABLE IF NOT EXISTS reseller_config_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /* One override row per reseller */
    reseller_id UUID NOT NULL UNIQUE REFERENCES reseller_profiles(id) ON DELETE CASCADE,

    /* ── Pricing overrides ──────────────────────────────────────────────── */
    default_retail_price_override DECIMAL(10,2)
        CHECK (default_retail_price_override IS NULL OR default_retail_price_override > 0),
    min_retail_price_override DECIMAL(10,2)
        CHECK (min_retail_price_override IS NULL OR min_retail_price_override > 0),
    max_retail_price_override DECIMAL(10,2)
        CHECK (max_retail_price_override IS NULL OR max_retail_price_override > 0),

    /* ── Commission overrides ───────────────────────────────────────────── */
    platform_fee_percent_override DECIMAL(5,2)
        CHECK (platform_fee_percent_override IS NULL
               OR (platform_fee_percent_override >= 0 AND platform_fee_percent_override <= 100)),
    default_sub_share_percent_override DECIMAL(5,2)
        CHECK (default_sub_share_percent_override IS NULL
               OR (default_sub_share_percent_override >= 0 AND default_sub_share_percent_override <= 100)),

    /* ── Cap overrides ──────────────────────────────────────────────────── */
    max_earnings_per_month_override DECIMAL(12,2)
        CHECK (max_earnings_per_month_override IS NULL OR max_earnings_per_month_override >= 0),

    /* ── Audit ──────────────────────────────────────────────────────────── */
    created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reseller_config_overrides_reseller
    ON reseller_config_overrides(reseller_id);

COMMENT ON TABLE reseller_config_overrides IS
    'Optional per-reseller config overrides. NULL columns fall back to global config values.';


-- ============================================================================
-- 4. GLOBAL CONFIG OVERRIDES
-- ============================================================================
-- Admin-editable global config overrides. Every config key in
-- reseller.config.js can be overridden at runtime by inserting a row here
-- with its dot-notation path and JSON value.
--
-- This enables "config-driven" behavior without deployments: admins can
-- change commission rates, price bounds, lock windows, etc. from the panel.

CREATE TABLE IF NOT EXISTS global_config_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * Namespace for the config (e.g., 'reseller', 'mlm', 'platform').
     * Allows the same table to serve all config-driven modules.
     */
    namespace VARCHAR(50) NOT NULL DEFAULT 'reseller',

    /*
     * Dot-notation path into the config object.
     * Example: 'commission.platformFeePercent' or 'pricing.minRetailPriceETB'
     */
    config_key VARCHAR(200) NOT NULL,

    /*
     * JSON-encoded value. Types are preserved via JSON (numbers as numbers,
     * booleans as booleans, strings as strings, null as null).
     */
    config_value JSONB NOT NULL,

    /* Human-readable note explaining why this override exists */
    note TEXT,

    /* Audit */
    created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    /* One override per (namespace, key) */
    UNIQUE (namespace, config_key)
);

CREATE INDEX IF NOT EXISTS idx_global_config_overrides_namespace
    ON global_config_overrides(namespace);

COMMENT ON TABLE global_config_overrides IS
    'Runtime config overrides editable via admin panel. Supports dot-notation keys per namespace.';


COMMIT;