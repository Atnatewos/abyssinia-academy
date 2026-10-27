-- ============================================================================
-- Migration: 017_agent_system.sql
--
-- Purpose:
--   Introduces the Agent System (Money Model v2.5) — a parallel commission
--   track where every student is automatically both an MLM referrer AND an
--   agent. Agent commissions pay INSTANTLY on admin approval (no 7-day lock),
--   and agent codes OVERRIDE both MLM referral codes and discount codes at
--   checkout.
--
-- Key additions:
--   1. agent_codes table — mirrors referral_codes but for agent attribution
--   2. agent_commissions table — instant-payout commissions (no unlock_at)
--   3. payments.agent_id — attribution link to the agent who drove the sale
--   4. users.is_agent — boolean flag (default true, every student is an agent)
--
-- Business rules enforced by schema:
--   - Agent commissions are final (no reversal window)
--   - One agent per payment (agent_id is nullable, single attribution)
--   - Agent codes are unique per user (like referral codes)
--   - Commission amounts are DECIMAL(10,2) for financial precision
--
-- Idempotency:
--   - All table creations use IF NOT EXISTS
--   - All column additions use IF NOT EXISTS patterns
--   - Safe to run multiple times
--
-- Path: apps/api/src/database/migrations/017_agent_system.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. USERS TABLE — Agent flag
-- ============================================================================
-- Every student is automatically an agent. This flag allows admin to
-- disable agent functionality for specific users if needed.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_agent BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_users_is_agent ON users(is_agent) WHERE is_agent = true;

COMMENT ON COLUMN users.is_agent IS $$
Agent System: Whether this user can earn agent commissions.
Default true — every student is automatically an agent.
$$;

-- ============================================================================
-- 2. AGENT CODES TABLE
-- ============================================================================
-- Stores unique agent codes assigned to each user. Mirrors referral_codes
-- structure but for the agent attribution system.

CREATE TABLE IF NOT EXISTS agent_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(12) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_codes_code ON agent_codes(code);
CREATE INDEX IF NOT EXISTS idx_agent_codes_user ON agent_codes(user_id);

COMMENT ON TABLE agent_codes IS $$
Agent attribution codes. Each user gets one unique code (auto-generated on
first access). Used to track which agent drove a sale for instant commission.
$$;

-- ============================================================================
-- 3. AGENT COMMISSIONS TABLE
-- ============================================================================
-- Instant-payout commissions with NO lock window. Unlike affiliate_commissions
-- which have a 7-day unlock_at, agent commissions are final and immediately
-- withdrawable upon admin approval.

CREATE TABLE IF NOT EXISTS agent_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('fixed', 'percentage')),
  commission_amount DECIMAL(10,2) NOT NULL CHECK (commission_amount >= 0),
  sale_amount DECIMAL(10,2) NOT NULL CHECK (sale_amount > 0),
  percentage_rate DECIMAL(5,2) DEFAULT 0 CHECK (percentage_rate >= 0 AND percentage_rate <= 100),
  status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'reversed')),
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (payment_id, agent_user_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_commissions_agent ON agent_commissions(agent_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_source ON agent_commissions(source_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_payment ON agent_commissions(payment_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_status ON agent_commissions(status) WHERE status = 'paid';

COMMENT ON TABLE agent_commissions IS $$
Instant-payout agent commissions. No lock window — funds are immediately
withdrawable upon admin approval of the payment. commission_type is either
'fixed' (flat ETB amount) or 'percentage' (% of sale_amount).
$$;

COMMENT ON COLUMN agent_commissions.commission_type IS $$
'fixed' = flat ETB amount (e.g., 500 ETB per sale)
'percentage' = % of sale_amount (e.g., 15% of 1000 ETB = 150 ETB)
$$;

-- ============================================================================
-- 4. PAYMENTS TABLE — Agent attribution
-- ============================================================================
-- Links each payment to the agent who drove the sale. Nullable because
-- not all payments come through agent codes.

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payments_agent_id ON payments(agent_id) WHERE agent_id IS NOT NULL;

COMMENT ON COLUMN payments.agent_id IS $$
Agent System: UUID of the agent whose code was used for this payment.
NULL if no agent code was applied (MLM referral or direct purchase).
$$;

-- ============================================================================
-- 5. AGENT SETTINGS TABLE (Admin-controlled commission rules)
-- ============================================================================
-- Stores per-agent commission configuration. Admin can set different rates
-- for different agents (e.g., top performers get higher percentages).

CREATE TABLE IF NOT EXISTS agent_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  commission_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (commission_type IN ('fixed', 'percentage')),
  commission_value DECIMAL(10,2) NOT NULL DEFAULT 500 CHECK (commission_value >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_settings_user ON agent_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_settings_active ON agent_settings(is_active) WHERE is_active = true;

COMMENT ON TABLE agent_settings IS $$
Per-agent commission configuration. Admin can override default rates for
specific agents. commission_type + commission_value determine the payout.
$$;

COMMENT ON COLUMN agent_settings.commission_value IS $$
For 'fixed' type: flat ETB amount per sale (e.g., 500)
For 'percentage' type: percentage rate (e.g., 15.00 = 15%)
$$;

-- ============================================================================
-- 6. BACKFILL — Create agent codes for existing users
-- ============================================================================
-- Every existing user gets an agent code so they can start earning immediately.

INSERT INTO agent_codes (user_id, code, is_active)
SELECT 
  u.id,
  'AGT-' || LEFT(REPLACE(u.id::text, '-', ''), 8),
  true
FROM users u
LEFT JOIN agent_codes ac ON ac.user_id = u.id
WHERE ac.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 7. BACKFILL — Create default agent settings for existing users
-- ============================================================================
-- Use the default commission rate from config (500 ETB fixed) for all users.

INSERT INTO agent_settings (user_id, commission_type, commission_value, is_active)
SELECT 
  u.id,
  'fixed',
  500,
  true
FROM users u
LEFT JOIN agent_settings a ON a.user_id = u.id
WHERE a.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 8. LEGACY TABLE COMMENTS
-- ============================================================================
COMMENT ON TABLE agent_codes IS 'Agent attribution codes. Parallel to referral_codes but for instant-payout agent commissions.';
COMMENT ON TABLE agent_commissions IS 'Instant-payout agent commissions. No lock window — funds immediately withdrawable.';
COMMENT ON TABLE agent_settings IS 'Per-agent commission configuration. Admin can override default rates.';

COMMIT;