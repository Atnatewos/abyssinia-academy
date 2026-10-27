-- ============================================================================
-- Migration: 018_add_user_pending_agent.sql
--
-- Purpose:
--   Adds `users.pending_agent_id` — the column that stores agent
--   attribution captured at registration time via /auth/register?agent=CODE.
--
--   The pending attribution is consumed on the buyer's first payment
--   submission (per agents.config.js → attribution.consumeOnFirstPayment)
--   and never reused, so buyers are attributed exactly once per agent.
--
-- Dependencies:
--   - users table (001)
--   - agent_codes table (017)
--
-- Idempotency:
--   - ALTER TABLE ADD COLUMN IF NOT EXISTS — safe to run multiple times
--   - Index creation guarded by IF NOT EXISTS
--
-- Path: apps/api/src/database/migrations/018_add_user_pending_agent.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Add pending_agent_id column
-- ============================================================================
-- NULL when the user did not register via an agent link. Populated with
-- the agent's user UUID when they did. Cleared after first payment submit.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS pending_agent_id UUID
  REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN users.pending_agent_id IS $$
Agent attribution captured at registration time from /auth/register?agent=CODE.
Consumed on the buyer's first payment submission (per agents.config.js →
attribution.consumeOnFirstPayment). NULL once consumed, or when the user
never registered via an agent link.
$$;

-- ============================================================================
-- 2. Partial index for the pending_agent_id lookup
-- ============================================================================
-- Most rows are NULL (users without agent attribution). A partial index
-- keeps the index small and the lookup fast.

CREATE INDEX IF NOT EXISTS idx_users_pending_agent_id
ON users(pending_agent_id)
WHERE pending_agent_id IS NOT NULL;

COMMIT;