-- ============================================================================
-- Migration: 022_scholarship_system.sql
--
-- Adds the complete scholarship program schema:
--   1. scholarship_campaigns    — admin-defined campaigns
--   2. scholarship_applications — user applications to campaigns
--   3. scholarship_application_events — append-only audit trail
--   4. Extensions to enrollments (purchase provenance)
--   5. Extensions to users (fast scholarship recipient filtering)
--   6. Extensions to payments (scholarship registration fee discriminator)
--
-- Idempotency: all CREATE TABLE / ADD COLUMN use IF NOT EXISTS.
-- Safe to run multiple times. Safe on a fresh DB and on prod.
--
-- Design notes:
--   - Campaign rows are the ONLY source of quota, fee, and grant truth.
--     The application flow reads from here; never from client payloads.
--   - Applications have UNIQUE(campaign_id, applicant_user_id) to prevent
--     spam. Enforced at DB level for concurrency safety.
--   - Approval flow MUST lock both the application row AND the campaign
--     row inside one transaction to prevent quota overshoot.
--   - All date columns default to CURRENT_TIMESTAMP so a campaign created
--     via the admin UI without explicit dates is immediately usable.
--
-- Path: apps/api/src/database/migrations/022_scholarship_system.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. SCHOLARSHIP CAMPAIGNS
-- Admin-defined scholarship offerings. Each row is a distinct campaign
-- that students can apply to.
-- ============================================================================

CREATE TABLE IF NOT EXISTS scholarship_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Public identifier used in URLs (/scholarships/<slug>). Must be unique
  -- so old links remain stable across renames.
  slug VARCHAR(80) UNIQUE NOT NULL,

  -- Bilingual display fields. *_am fall back to the base value in the UI
  -- when null.
  name VARCHAR(200) NOT NULL,
  name_am VARCHAR(200),
  description TEXT,
  description_am TEXT,

  -- What the scholarship grants access to.
  -- grants_full_course = true  → access to the entire course
  -- grants_phases has items    → access to the listed phase IDs
  -- both set                   → access to full course + listed phases
  --                             (the phases are redundant but harmless;
  --                              useful for future partial-grant features)
  grants_full_course BOOLEAN NOT NULL DEFAULT true,
  grants_phases TEXT[],

  -- Cost to the recipient. When > 0, the approval flow does NOT grant
  -- enrollment until the registration fee payment is approved. When 0,
  -- approval grants enrollment immediately.
  registration_fee_etb DECIMAL(10, 2) NOT NULL DEFAULT 0
    CHECK (registration_fee_etb >= 0),

  -- Capacity controls. approved_count is maintained transactionally.
  quota INTEGER NOT NULL DEFAULT 100
    CHECK (quota > 0),
  approved_count INTEGER NOT NULL DEFAULT 0
    CHECK (approved_count >= 0),

  -- Application window. applications_close_at can be NULL for
  -- open-ended campaigns. When set, applications close at that time.
  applications_open_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  applications_close_at TIMESTAMP,

  -- Kill switch. When false, the campaign is invisible to the public
  -- banner and cannot accept new applications. Existing applications
  -- remain reviewable so admins can finish what they started.
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Presentation. Cover image is optional; the UI falls back to a
  -- gradient placeholder when null.
  cover_image_url TEXT,

  -- Document requirements. Structure:
  --   [{ "type": "student_id", "required": true },
  --    { "type": "transcript", "required": false }]
  -- The "type" keys must match scholarshipsConfig.documentTypes.
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Audit
  created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Campaign must grant SOMETHING. Either full course, or at least
  -- one specific phase.
  CONSTRAINT scholarship_campaigns_grants_something
    CHECK (grants_full_course = true OR grants_phases IS NOT NULL),

  -- Application window must not be inverted.
  CONSTRAINT scholarship_campaigns_dates_ordered
    CHECK (applications_close_at IS NULL OR applications_close_at > applications_open_at),

  -- Quota cannot be exceeded in the same row.
  CONSTRAINT scholarship_campaigns_quota_bounded
    CHECK (approved_count <= quota)
);

-- Fast lookup of active, currently-open campaigns for the public banner.
CREATE INDEX IF NOT EXISTS idx_scholarship_campaigns_active_open
  ON scholarship_campaigns (is_active, applications_close_at)
  WHERE is_active = true;

-- Fast lookup by slug for the campaign detail page.
CREATE INDEX IF NOT EXISTS idx_scholarship_campaigns_slug
  ON scholarship_campaigns (slug);

COMMENT ON TABLE scholarship_campaigns IS
  'Admin-defined scholarship campaigns. Each row is an independently configurable offering with its own quota, fee, and phase grants.';

COMMENT ON COLUMN scholarship_campaigns.approved_count IS
  'Maintained transactionally at approval time. MUST only be incremented while holding a row lock on the campaign.';


-- ============================================================================
-- 2. SCHOLARSHIP APPLICATIONS
-- A user's request to join a campaign. Lifecycle:
--
--   pending ──[admin approve]──> pending_payment ──[payment approved]──> approved
--      │                                │
--      │                                └──[admin revoke]──> rejected
--      │
--      ├──[admin reject]──> rejected
--      │
--      └──[student withdraw]──> withdrawn
--
-- approved applications may later be revoked (status = 'revoked'),
-- which flips access off without deleting the enrollment row.
-- ============================================================================

CREATE TABLE IF NOT EXISTS scholarship_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  campaign_id UUID NOT NULL
    REFERENCES scholarship_campaigns(id) ON DELETE CASCADE,

  applicant_user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  -- Lifecycle status. Constrained so no unexpected values can appear.
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'pending_payment',
      'approved',
      'rejected',
      'withdrawn',
      'revoked'
    )),

  -- Applicant-submitted content.
  motivation TEXT NOT NULL,

  -- Uploaded documents. Structure:
  --   { "student_id": { "url": "...", "publicId": "...", "size": 123456 },
  --     "transcript": { ... } }
  -- The keys must match the campaign's required_documents types.
  documents JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Admin review.
  reviewed_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  rejection_reason TEXT,

  -- Approval artifacts (set only when enrollment is created).
  enrollment_id UUID,  -- FK added after enrollments ALTER below
  enrollment_created_at TIMESTAMP,

  -- Payment window management. When status = 'pending_payment', this
  -- is the deadline for the fee payment. After this timestamp, the
  -- application auto-expires (handled by a background job or manual
  -- admin action — not by the DB).
  payment_due_at TIMESTAMP,

  -- Revocation tracking.
  revoked_at TIMESTAMP,
  revoked_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  revocation_reason TEXT,

  -- Audit
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- One application per user per campaign. Enforced at DB level to
  -- prevent race-condition spam.
  CONSTRAINT scholarship_applications_unique_per_campaign
    UNIQUE (campaign_id, applicant_user_id),

  -- Rejection must have a reason when status transitions to rejected.
  -- The CHECK fires on every row insert/update; we allow NULL reason
  -- only when status is NOT 'rejected'.
  CONSTRAINT scholarship_applications_rejected_has_reason
    CHECK (status <> 'rejected' OR rejection_reason IS NOT NULL)
);

-- Fast lookup of applications by campaign + status (admin review queue).
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_campaign_status
  ON scholarship_applications (campaign_id, status, created_at DESC);

-- Fast lookup of a user's own applications.
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_applicant
  ON scholarship_applications (applicant_user_id, created_at DESC);

-- Fast lookup of pending review queue across all campaigns.
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_pending
  ON scholarship_applications (created_at DESC)
  WHERE status = 'pending';

-- Fast lookup of pending_payment applications for the expiry sweeper.
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_pending_payment
  ON scholarship_applications (payment_due_at)
  WHERE status = 'pending_payment';

COMMENT ON TABLE scholarship_applications IS
  'User applications to scholarship campaigns. One application per user per campaign enforced by UNIQUE constraint. Status lifecycle documented above.';

COMMENT ON COLUMN scholarship_applications.payment_due_at IS
  'Set when status transitions to pending_payment. After this time the application is eligible for auto-expiry (background job or admin action).';


-- ============================================================================
-- 3. SCHOLARSHIP APPLICATION EVENTS
-- Append-only audit trail. Every status change writes one row so we can
-- reconstruct the full lifecycle of any application.
-- ============================================================================

CREATE TABLE IF NOT EXISTS scholarship_application_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  application_id UUID NOT NULL
    REFERENCES scholarship_applications(id) ON DELETE CASCADE,

  event_type VARCHAR(40) NOT NULL
    CHECK (event_type IN (
      'submitted',
      'reviewed',
      'approved',
      'pending_payment',
      'payment_received',
      'rejected',
      'revoked',
      'withdrawn',
      'noted'
    )),

  -- Actor can be a user OR an admin, but not both. The CHECK below
  -- enforces "at most one non-null actor".
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,

  -- Snapshot of what changed. Free-form JSON so future event types
  -- don't need schema changes.
  payload JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT scholarship_application_events_one_actor
    CHECK (
      (actor_user_id IS NOT NULL AND actor_admin_id IS NULL)
      OR (actor_user_id IS NULL AND actor_admin_id IS NOT NULL)
      OR (actor_user_id IS NULL AND actor_admin_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_scholarship_events_application
  ON scholarship_application_events (application_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scholarship_events_type
  ON scholarship_application_events (event_type, created_at DESC);

COMMENT ON TABLE scholarship_application_events IS
  'Append-only audit trail for scholarship application lifecycle. Never UPDATE, only INSERT. Used for reconstruction and admin audit views.';


-- ============================================================================
-- 4. ENROLLMENTS EXTENSIONS
-- Add scholarship provenance columns so any enrollment can be traced to
-- either a payment or a scholarship.
-- ============================================================================

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS purchase_mode VARCHAR(30),

  ADD COLUMN IF NOT EXISTS selected_phases TEXT[],

  ADD COLUMN IF NOT EXISTS purchase_amount DECIMAL(10, 2),

  ADD COLUMN IF NOT EXISTS payment_id UUID,

  ADD COLUMN IF NOT EXISTS purchase_source VARCHAR(30)
    DEFAULT 'payment',

  ADD COLUMN IF NOT EXISTS scholarship_application_id UUID,

  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP,

  ADD COLUMN IF NOT EXISTS revocation_reason TEXT;

-- Constraint on purchase_source. Postgres doesn't support ADD CONSTRAINT
-- IF NOT EXISTS, so this is guarded.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_purchase_source_check'
  ) THEN
    ALTER TABLE enrollments
      ADD CONSTRAINT enrollments_purchase_source_check
      CHECK (purchase_source IN ('payment', 'scholarship', 'admin_manual'));
  END IF;
END $$;

-- FK for scholarship provenance.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_scholarship_application_fk'
  ) THEN
    ALTER TABLE enrollments
      ADD CONSTRAINT enrollments_scholarship_application_fk
      FOREIGN KEY (scholarship_application_id)
      REFERENCES scholarship_applications(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Now that enrollments references scholarship_applications, add the
-- reverse FK from scholarship_applications → enrollments. This forms a
-- 1-to-1 relationship.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scholarship_applications_enrollment_fk'
  ) THEN
    ALTER TABLE scholarship_applications
      ADD CONSTRAINT scholarship_applications_enrollment_fk
      FOREIGN KEY (enrollment_id)
      REFERENCES enrollments(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Index for admin queries that filter enrollments by source.
CREATE INDEX IF NOT EXISTS idx_enrollments_source
  ON enrollments (purchase_source, enrolled_at DESC);

-- Index for reconciliation queries: "which enrollments came from a
-- scholarship?"
CREATE INDEX IF NOT EXISTS idx_enrollments_scholarship
  ON enrollments (scholarship_application_id)
  WHERE scholarship_application_id IS NOT NULL;


-- ============================================================================
-- 5. USERS EXTENSIONS
-- Fast filtering of scholarship recipients without a JOIN every time.
-- ============================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_scholarship_recipient BOOLEAN
    NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS scholarship_campaign_id UUID;

-- FK for the "which campaign did they receive" lookup.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_scholarship_campaign_fk'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_scholarship_campaign_fk
      FOREIGN KEY (scholarship_campaign_id)
      REFERENCES scholarship_campaigns(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Partial index for the "list all scholarship recipients" admin query.
CREATE INDEX IF NOT EXISTS idx_users_scholarship_recipients
  ON users (is_scholarship_recipient)
  WHERE is_scholarship_recipient = true;


-- ============================================================================
-- 6. PAYMENTS EXTENSIONS
-- Discriminate scholarship registration fees from course payments.
-- ============================================================================

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30)
    DEFAULT 'course',

  ADD COLUMN IF NOT EXISTS scholarship_application_id UUID;

-- Constraint on purpose values.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_purpose_check'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_purpose_check
      CHECK (purpose IN ('course', 'scholarship_registration'));
  END IF;
END $$;

-- FK to the application that this fee belongs to.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_scholarship_application_fk'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_scholarship_application_fk
      FOREIGN KEY (scholarship_application_id)
      REFERENCES scholarship_applications(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Index for "all payments for this application" reconciliation.
CREATE INDEX IF NOT EXISTS idx_payments_scholarship
  ON payments (scholarship_application_id)
  WHERE scholarship_application_id IS NOT NULL;

-- Index for admin filter "show me all scholarship registration fees".
CREATE INDEX IF NOT EXISTS idx_payments_purpose
  ON payments (purpose, created_at DESC)
  WHERE purpose = 'scholarship_registration';


COMMIT;

-- ============================================================================
-- VERIFICATION (run manually after migration to confirm state)
-- ============================================================================
--
--   SELECT table_name FROM information_schema.tables
--   WHERE table_name LIKE 'scholarship%';
--   -- expect: scholarship_campaigns, scholarship_applications, scholarship_application_events
--
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'enrollments'
--     AND column_name IN ('purchase_source', 'scholarship_application_id', 'revoked_at');
--   -- expect: 3 rows
--
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'payments'
--     AND column_name IN ('purpose', 'scholarship_application_id');
--   -- expect: 2 rows
-- ============================================================================