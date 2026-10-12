-- ============================================================================
-- Migration: 014_announcements_history.sql
--
-- Purpose:
--   Stores every admin broadcast announcement as a permanent audit record.
--   Gives admins a dedicated history view showing what was sent, to whom,
--   when, and by which administrator.
--
-- Key features:
--   1. Stores the raw title + body so history remains accurate even if
--      notification content templates change later.
--   2. target_user_ids is a UUID[] array — only populated when the
--      audience is 'targeted'; NULL for 'all' / 'enrolled'.
--   3. recipient_count is stamped at send time (snapshot of actual reach).
--   4. admin_id references admins(id) for "sent by" attribution.
--
-- Indexes:
--   - idx_announcements_created_at: fast recent-first history queries
--   - idx_announcements_admin_id: per-admin history filtering
--
-- Idempotency:
--   - Uses IF NOT EXISTS, safe to run repeatedly
--
-- Rollback:
--   DROP TABLE announcements CASCADE;
--
-- Path: apps/api/src/database/migrations/014_announcements_history.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  audience VARCHAR(20) NOT NULL CHECK (audience IN ('all', 'enrolled', 'targeted', 'single')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'success', 'warning', 'critical')),
  title VARCHAR(120) NOT NULL,
  body VARCHAR(500) NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  target_user_ids UUID[] DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE announcements IS $$
Permanent audit log of admin broadcast announcements. Stores the exact
content sent so history remains accurate even if templates change later.
Powers the Announcements > History tab for admin review.
$$;

COMMENT ON COLUMN announcements.admin_id IS $$
ID of the admin who sent the broadcast. Used for "sent by" attribution
in the history view.
$$;

COMMENT ON COLUMN announcements.audience IS $$
Targeting mode at send time: all | enrolled | targeted | single.
The 'single' value is legacy; 'targeted' is the new multi-select mode.
$$;

COMMENT ON COLUMN announcements.severity IS $$
Severity chosen at send time: info | success | warning | critical.
$$;

COMMENT ON COLUMN announcements.title IS $$
Raw title string as it was sent. Stored verbatim for historical accuracy.
$$;

COMMENT ON COLUMN announcements.body IS $$
Raw body string as it was sent. Stored verbatim for historical accuracy.
$$;

COMMENT ON COLUMN announcements.recipient_count IS $$
Number of users who actually received this broadcast at send time.
Computed by the broadcast endpoint and stamped here.
$$;

COMMENT ON COLUMN announcements.target_user_ids IS $$
Array of user IDs when audience is 'targeted'. NULL for 'all' / 'enrolled'.
Stored so the history view can show which specific users were targeted.
$$;

-- Fast recent-first history queries
CREATE INDEX IF NOT EXISTS idx_announcements_created_at
  ON announcements(created_at DESC);

-- Per-admin history filtering
CREATE INDEX IF NOT EXISTS idx_announcements_admin_id
  ON announcements(admin_id, created_at DESC);

COMMIT;