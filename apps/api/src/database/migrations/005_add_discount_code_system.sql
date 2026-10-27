/**
 * Migration: Discount Code System Tables
 * Creates discount_codes, discount_code_usage, and discount_code_abuse_log tables.
 * Adds discount_code_used, discount_code_amount, referral_discount_amount,
 * and credit_applied columns to payments table.
 * Path: apps/api/src/database/migrations/005_add_discount_code_system.sql
 */

-- ============================================================================
-- DISCOUNT CODES TABLE
-- Stores admin-created promotional discount codes
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_codes (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * The discount code string (e.g., 'LAUNCH2026', 'EARLYBIRD')
     * Case-insensitive unique
     */
    code VARCHAR(20) UNIQUE NOT NULL,

    /*
     * Type of discount:
     * 'percentage' = X% off the purchase
     * 'fixed_amount' = X ETB off the purchase
     */
    type VARCHAR(20) NOT NULL DEFAULT 'percentage'
        CHECK (type IN ('percentage', 'fixed_amount')),

    /*
     * Discount value:
     * For percentage: 25 means 25% off
     * For fixed_amount: 500 means 500 ETB off
     */
    value DECIMAL(10,2) NOT NULL,

    /*
     * Admin notes — internal description of what this code is for
     */
    description TEXT,

    /*
     * Amharic description for admin reference
     */
    description_am TEXT,

    /*
     * Maximum total number of times this code can be used
     * 0 = unlimited uses
     */
    max_total_uses INT DEFAULT 0,

    /*
     * Maximum number of times a single user can use this code
     * 0 = unlimited per user
     */
    max_uses_per_user INT DEFAULT 1,

    /*
     * How many times this code has been used so far
     */
    current_total_uses INT DEFAULT 0,

    /*
     * Minimum purchase amount required to use this code
     * 0 = no minimum
     */
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,

    /*
     * Whether this code can be used for full course purchases
     */
    eligible_for_full_course BOOLEAN DEFAULT true,

    /*
     * Which phases this code is eligible for
     * NULL = all phases
     * ARRAY['phase-1', 'phase-3'] = only those specific phases
     */
    eligible_phases TEXT[] DEFAULT NULL,

    /*
     * Whether this code can only be used by first-time enrollees
     * true = only users who have never enrolled before
     */
    first_time_only BOOLEAN DEFAULT false,

    /*
     * When this code becomes valid
     * NULL = valid immediately
     */
    valid_from TIMESTAMP DEFAULT NULL,

    /*
     * When this code expires
     * NULL = never expires
     */
    valid_until TIMESTAMP DEFAULT NULL,

    /*
     * Current status:
     * 'active' = code is usable
     * 'paused' = temporarily disabled
     * 'disabled' = permanently disabled
     */
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'disabled')),

    /*
     * Soft delete flag — allows recovery if accidentally deleted
     */
    is_deleted BOOLEAN DEFAULT false,

    /*
     * Which admin created this code
     */
    created_by UUID REFERENCES admins(id),

    /*
     * Timestamps
     */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_discount_codes_status ON discount_codes(status);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_until ON discount_codes(valid_until);

-- ============================================================================
-- DISCOUNT CODE USAGE TABLE
-- Tracks every time a discount code is used
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_code_usage (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * Which discount code was used
     */
    discount_code_id UUID NOT NULL REFERENCES discount_codes(id),

    /*
     * Which user used the code
     */
    user_id UUID NOT NULL REFERENCES users(id),

    /*
     * Link to the payment where the code was applied
     */
    payment_id UUID REFERENCES payments(id),

    /*
     * Link to the enrollment
     */
    enrollment_id UUID REFERENCES enrollments(id),

    /*
     * How much discount was given (in ETB)
     */
    discount_amount DECIMAL(10,2) NOT NULL,

    /*
     * Original price before this discount was applied
     */
    original_amount DECIMAL(10,2) NOT NULL,

    /*
     * Final price after this discount
     */
    final_amount DECIMAL(10,2) NOT NULL,

    /*
     * IP address of the user when the code was applied
     * Used for fraud detection
     */
    ip_address VARCHAR(45),

    /*
     * Browser user agent string
     */
    user_agent TEXT,

    /*
     * When the code was applied
     */
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /*
     * Whether the anti-abuse system flagged this usage
     */
    is_suspicious BOOLEAN DEFAULT false,

    /*
     * Why it was flagged (if suspicious)
     */
    suspicious_reason TEXT,

    /*
     * Risk score assigned by anti-abuse system (0-100)
     */
    risk_score INT DEFAULT 0
);

-- Indexes for queries and fraud detection
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user ON discount_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_payment ON discount_code_usage(payment_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_ip ON discount_code_usage(ip_address);
CREATE INDEX IF NOT EXISTS idx_discount_usage_applied ON discount_code_usage(applied_at);

-- ============================================================================
-- DISCOUNT CODE ABUSE LOG TABLE
-- Records suspicious activity for admin review
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_code_abuse_log (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * The user involved (if known)
     */
    user_id UUID REFERENCES users(id),

    /*
     * The discount code involved (if known)
     */
    discount_code_id UUID REFERENCES discount_codes(id),

    /*
     * IP address of the suspicious activity
     */
    ip_address VARCHAR(45),

    /*
     * Why this was flagged
     * 'rate_limit', 'suspicious_ip', 'multiple_accounts', 'rapid_fire', etc.
     */
    reason VARCHAR(100) NOT NULL,

    /*
     * Additional context as JSON
     * Example: {"attempts_in_last_minute": 15, "unique_codes_tried": 8}
     */
    details JSONB DEFAULT '{}',

    /*
     * Severity level
     */
    severity VARCHAR(20) DEFAULT 'low'
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    /*
     * When this was logged
     */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin review
CREATE INDEX IF NOT EXISTS idx_abuse_log_user ON discount_code_abuse_log(user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_log_ip ON discount_code_abuse_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_abuse_log_created ON discount_code_abuse_log(created_at);

-- ============================================================================
-- PAYMENTS TABLE — Add Discount Tracking Columns
-- ============================================================================

/*
 * Which discount code was used for this payment (if any)
 */
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS discount_code_used VARCHAR(20);

/*
 * How much discount the discount code provided
 */
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS discount_code_amount DECIMAL(10,2) DEFAULT 0;

/*
 * How much referral discount was applied
 */
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS referral_discount_amount DECIMAL(10,2) DEFAULT 0;

/*
 * How much credit was applied from the user's referral earnings
 */
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS credit_applied DECIMAL(10,2) DEFAULT 0;