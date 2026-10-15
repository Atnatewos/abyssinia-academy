-- ============================================================================
-- Migration: 013_notifications.sql
--
-- Purpose:
--   Creates the notifications table for the in-app notification system.
--   Supports 12 notification types (payment, referral, bonus, security, etc.)
--   with i18n keys resolved at render time, retention policies, and grouping.
--
-- Key features:
--   1. title_key + body_key are i18n keys (not raw text) so language switch
--      re-renders old notifications correctly.
--   2. title_tokens + body_tokens are JSONB for template variable injection.
--   3. severity enum (info, success, warning, critical) drives visual treatment.
--   4. is_read + read_at support mark-read state + read-archive cleanup.
--   5. expires_at enables automatic retention (30 days default from config).
--   6. link column supports deep-linking to specific pages/sections.
--
-- Indexes:
--   - idx_notifications_user_unread: fast unread count + paginated list
--   - idx_notifications_user_all: full history (read + unread)
--   - idx_notifications_expires: cleanup cron or lazy purge on read
--
-- Idempotency:
--   - All DDL uses IF NOT EXISTS
--   - Safe to run multiple times
--
-- Rollback:
--   DROP TABLE notifications CASCADE;
--
-- Path: apps/api/src/database/migrations/013_notifications.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title_key VARCHAR(100) NOT NULL,
  title_tokens JSONB DEFAULT '{}'::jsonb,
  body_key VARCHAR(100) NOT NULL,
  body_tokens JSONB DEFAULT '{}'::jsonb,
  link VARCHAR(255),
  icon VARCHAR(50),
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

COMMENT ON TABLE notifications IS $$
In-app notification center. Each row represents a single notification event
triggered by platform actions (payment approved, bonus awarded, referral
signed up, etc.). Title and body are i18n keys resolved at render time,
not raw strings, so language switching re-renders correctly.
$$;

COMMENT ON COLUMN notifications.type IS $$
Notification type enum key (e.g., 'payment_approved', 'bonus_awarded').
Maps to config entry in notifications.config.js which defines icon,
severity, and i18n keys.
$$;

COMMENT ON COLUMN notifications.title_key IS $$
i18n key for the notification title (e.g., 'notification.paymentApproved.title').
Resolved at render time from i18n config, not stored as raw text.
$$;

COMMENT ON COLUMN notifications.title_tokens IS $$
JSONB object of template variables for the title (e.g., {amount: 1000}).
Injected into the i18n string at render time.
$$;

COMMENT ON COLUMN notifications.body_key IS $$
i18n key for the notification body (e.g., 'notification.paymentApproved.body').
$$;

COMMENT ON COLUMN notifications.body_tokens IS $$
JSONB object of template variables for the body (e.g., {amount: 1000, method: 'telebirr'}).
$$;

COMMENT ON COLUMN notifications.link IS $$
Optional deep-link URL where clicking the notification navigates
(e.g., '/profile/payments', '/profile/referrals').
$$;

COMMENT ON COLUMN notifications.icon IS $$
Lucide icon name (e.g., 'CheckCircle', 'Trophy'). Read from config at
render time. Stored for audit/query purposes.
$$;

COMMENT ON COLUMN notifications.severity IS $$
Visual severity level: info (blue), success (green), warning (amber),
critical (red). Drives left-accent bar color in the dropdown.
$$;

COMMENT ON COLUMN notifications.is_read IS $$
Mark-read state. False = unread (shows accent bar + bold title).
True = read (muted, no accent).
$$;

COMMENT ON COLUMN notifications.read_at IS $$
Timestamp when the notification was marked as read. NULL if unread.
Used for read-archive cleanup (14 days default from config).
$$;

COMMENT ON COLUMN notifications.expires_at IS $$
Auto-cleanup timestamp. Rows where expires_at < NOW() are purged on
read or by cleanup cron. Default: created_at + 30 days (config-driven).
$$;

-- Fast unread count + paginated list (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

-- Full history (read + unread)
CREATE INDEX IF NOT EXISTS idx_notifications_user_all
  ON notifications(user_id, created_at DESC);

-- Cleanup cron or lazy purge
CREATE INDEX IF NOT EXISTS idx_notifications_expires
  ON notifications(expires_at)
  WHERE expires_at IS NOT NULL;

COMMIT;