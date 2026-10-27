/**
 * Migration: Referral System Tables
 * Creates referral_codes, referrals, and referral_earnings tables.
 * Adds referred_by_code and referral_discount_percent to users table.
 * Path: apps/api/src/database/migrations/004_add_referral_system.sql
 */

-- ============================================================================
-- REFERRAL CODES TABLE
-- Stores unique referral codes assigned to each user
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_codes (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * The user who owns this referral code
     */
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    /*
     * The unique referral code (e.g., 'ABY3XK9M')
     */
    code VARCHAR(8) UNIQUE NOT NULL,

    /*
     * Whether this code is active (can be disabled by admin)
     */
    is_active BOOLEAN DEFAULT true,

    /*
     * When this code was created
     */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /*
     * Each user can only have one referral code
     */
    UNIQUE(user_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);

-- ============================================================================
-- REFERRALS TABLE
-- Tracks every referral relationship between users
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * The user who shared their referral code (the referrer)
     */
    referrer_id UUID NOT NULL REFERENCES users(id),

    /*
     * The user who signed up using the code (the referred)
     */
    referred_user_id UUID NOT NULL REFERENCES users(id),

    /*
     * The referral code that was used
     */
    referral_code VARCHAR(8) NOT NULL,

    /*
     * Current status of this referral:
     * 'registered' = user signed up but hasn't enrolled yet
     * 'enrolled' = user has enrolled but payment not verified
     * 'completed' = payment verified, credits awarded
     * 'expired' = registration expired without enrollment
     * 'refunded' = payment was refunded
     */
    status VARCHAR(20) DEFAULT 'registered'
        CHECK (status IN ('registered', 'enrolled', 'completed', 'expired', 'refunded')),

    /*
     * Discount percentage the referred student received
     */
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,

    /*
     * Discount amount in ETB the referred student received
     */
    discount_amount DECIMAL(10,2) DEFAULT 0,

    /*
     * Credit percentage the referrer earned from this referral
     */
    referrer_credit_percent DECIMAL(5,2) NOT NULL DEFAULT 0,

    /*
     * Credit amount in ETB the referrer earned
     */
    referrer_credit_amount DECIMAL(10,2) DEFAULT 0,

    /*
     * Cash commission earned (if credit cap was exceeded)
     */
    commission_earned DECIMAL(10,2) DEFAULT 0,

    /*
     * Link to the enrollment record
     */
    enrollment_id UUID REFERENCES enrollments(id),

    /*
     * Link to the payment record
     */
    payment_id UUID REFERENCES payments(id),

    /*
     * When the referral was created
     */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /*
     * When the referral was completed (payment verified)
     */
    completed_at TIMESTAMP,

    /*
     * Each user can only be referred once
     */
    UNIQUE(referred_user_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ============================================================================
-- REFERRAL EARNINGS TABLE
-- Tracks accumulated earnings for each referrer
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_earnings (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * The referrer who earned these rewards
     */
    user_id UUID NOT NULL REFERENCES users(id),

    /*
     * Total credit earned (lifetime)
     */
    total_credit_earned DECIMAL(10,2) DEFAULT 0,

    /*
     * Total credit used toward purchases
     */
    total_credit_used DECIMAL(10,2) DEFAULT 0,

    /*
     * Currently available credit balance
     */
    available_credit DECIMAL(10,2) DEFAULT 0,

    /*
     * Total cash commission earned (lifetime)
     */
    total_commission_earned DECIMAL(10,2) DEFAULT 0,

    /*
     * Total cash commission already paid out
     */
    total_commission_paid DECIMAL(10,2) DEFAULT 0,

    /*
     * Cash commission pending payout
     */
    pending_commission DECIMAL(10,2) DEFAULT 0,

    /*
     * Total number of referral attempts (including incomplete)
     */
    total_referrals INT DEFAULT 0,

    /*
     * Number of successfully completed referrals
     */
    successful_referrals INT DEFAULT 0,

    /*
     * Current tier level (bronze, silver, gold, platinum, diamond)
     */
    current_tier VARCHAR(20) DEFAULT 'bronze',

    /*
     * When the tier was last updated
     */
    tier_updated_at TIMESTAMP,

    /*
     * When this record was last updated
     */
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /*
     * One earnings record per user
     */
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_earnings_user ON referral_earnings(user_id);

-- ============================================================================
-- USERS TABLE — Add Referral Columns
-- ============================================================================

/*
 * The referral code used during registration (if any)
 */
ALTER TABLE users
ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(8);

/*
 * The discount percentage this user received from a referral
 */
ALTER TABLE users
ADD COLUMN IF NOT EXISTS referral_discount_percent DECIMAL(5,2) DEFAULT 0;