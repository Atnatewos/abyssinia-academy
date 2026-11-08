/**
 * @fileoverview Scholarship System Configuration
 *
 * Single source of truth for every scholarship-related business value in
 * the platform. This config drives:
 *
 *   - Application validation (motivation length, doc types, doc size)
 *   - Default values for newly created campaigns
 *   - Application lifecycle rules (reapply policy, enrollment conflict)
 *   - Registration fee handling (checkout integration, commission bypass)
 *   - Notification payloads for every scholarship event
 *   - Public API behavior (banner visibility, cache timing)
 *   - Admin UX defaults (page size, auto-approve rule)
 *
 * DOCUMENT TYPES — HOW TO ADD / REMOVE REQUIREMENTS
 * ─────────────────────────────────────────────────
 * The `documentTypes` map below is the platform-wide registry of every
 * document type that any campaign can request. Campaigns reference a
 * subset via their `required_documents` JSONB column, but ONLY types
 * listed in this map are accepted by validation.
 *
 * To add a new document type (e.g. "passport"):
 *   1. Add it to `documentTypes` below (snake_case key)
 *   2. Add its label to `i18n/<lang>/scholarships.js` under
 *      `scholarships.documents.<camelCaseKey>` — see the bridge in the
 *      admin form (ScholarshipCampaignForm.jsx → toCamelKey())
 *   3. Restart the dev server — the new type shows up automatically in
 *      every admin create/edit form and student form
 *
 * To remove a document type:
 *   1. Delete it from `documentTypes` below
 *   2. Existing campaigns keep their stored reference in JSONB; the
 *      admin UI will show "(removed)" next to unrecognized types so
 *      they can be cleaned up
 *   3. No schema migration needed — the DB just stores strings
 *
 * Every value here can be overridden by environment variables for
 * deployment-level tuning (e.g. quotas per environment) but the
 * defaults below are production-reasonable.
 *
 * ARCHITECTURAL NOTES
 * ───────────────────
 * 1. Scholarships grant enrollment WITHOUT going through a payment for
 *    the course fee itself. They may include a "registration fee" that
 *    DOES go through the checkout system, but that fee is NOT a sale —
 *    it does not distribute MLM or agent commissions.
 *
 * 2. Every campaign is a distinct row in `scholarship_campaigns` so
 *    multiple campaigns can run simultaneously with independent quotas,
 *    fee amounts, and phase grants.
 *
 * 3. The approval flow creates a REAL `enrollments` row — identical in
 *    shape to payment-approved enrollments, distinguishable only by
 *    `purchase_source = 'scholarship'`. The portal, progress tracking,
 *    and access-control middleware already work with any enrollment.
 *
 * 4. Registration fee payments are `payments` rows with
 *    `purpose = 'scholarship_registration'`. That discriminator lets
 *    the approve-payment route know NOT to distribute commissions.
 *
 * 5. All 8 notification events use the existing `notify()` infrastructure
 *    from lib/notifications.js — no new notification engine.
 *
 * 6. Scholarship recipients ARE eligible to be referrers and agents —
 *    they can earn commissions like any other enrolled student. Their
 *    free/reduced-fee enrollment does not exclude them from the earnings
 *    engine. See rules.scholarshipRecipientsExcludedFromMlm below.
 *
 * Path: packages/shared/config/scholarships.config.js
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
 * ENVIRONMENT HELPERS
 * ───────────────────────────────────────────────────────────── */

const envInt = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === null || raw === '') return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const envBool = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === null || raw === '') return fallback;
  return String(raw).toLowerCase() !== 'false';
};

const envList = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === null || raw === '') return fallback;
  return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
};

const envEnum = (key, allowed, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === null || raw === '') return fallback;
  const value = String(raw).trim();
  return allowed.includes(value) ? value : fallback;
};

const scholarshipsConfig = {
  /* ==========================================================================
   * MASTER KILL SWITCH
   * ========================================================================== */
  enabled: envBool('SCHOLARSHIPS_ENABLED', true),

  /* ==========================================================================
   * APPLICATION DEFAULTS
   * ========================================================================== */
  defaults: {
    quota: envInt('SCHOLARSHIP_DEFAULT_QUOTA', 100),
    registrationFeeETB: envInt('SCHOLARSHIP_DEFAULT_FEE_ETB', 0),

        /*
     * Grace window (in seconds) applied when the public listing filters
     * `applications_open_at`. The form sets the open time to "now" when
     * an admin creates a campaign — this can race the query by less than
     * a second, hiding a fresh campaign from the public view. The grace
     * window makes it immediately visible.
     */

    openingGraceSeconds: envInt('SCHOLARSHIP_OPENING_GRACE_SECONDS', 60),
    requiresPhoneVerification: envBool(
      'SCHOLARSHIP_REQUIRE_PHONE_VERIFICATION',
      false
    ),
    motivationMinChars: envInt('SCHOLARSHIP_MIN_MOTIVATION_CHARS', 100),
    motivationMaxChars: envInt('SCHOLARSHIP_MAX_MOTIVATION_CHARS', 2000),
    allowedDocumentTypes: envList('SCHOLARSHIP_ALLOWED_DOC_TYPES', [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]),
    maxDocumentSizeBytes: envInt(
      'SCHOLARSHIP_MAX_DOC_SIZE_BYTES',
      5 * 1024 * 1024
    ),
    maxDocumentsPerApplication: envInt(
      'SCHOLARSHIP_MAX_DOCS_PER_APP',
      10
    ),
    coverImageAspectRatio: '16/9',
  },

  /* ==========================================================================
   * PHASE GRANTS
   * ========================================================================== */
  allowedPhaseIds: envList('SCHOLARSHIP_ALLOWED_PHASES', [
    'phase-1',
    'phase-2',
    'phase-3',
    'phase-4',
    'phase-5',
  ]),

  /* ==========================================================================
   * BUSINESS RULES
   * ========================================================================== */
  rules: {
    oneApplicationPerUserPerCampaign: true,
    requireRegistrationBeforeApply: true,
    allowReapplyDifferentCampaign: true,
    bannedUsersCannotApply: true,
    scholarshipRecipientsExcludedFromMlm: false,
    commissionDistributionOnScholarshipFee: false,
    mergeWithExistingEnrollments: true,
    revokePreservesProgress: true,

        /*
     * When a paid campaign's registration fee is collected at APPLY time
     * (rather than at approval time), rejected applications must refund
     * the fee. Since Ethiopian payment rails require manual refunds, the
     * flow uses a `refund_pending → refunded` status pair. The admin
     * sees pending refunds on their dashboard and marks each one as
     * refunded once the Telebirr transfer is complete.
     *
     * When true: fee is collected at apply, refund flow activates.
     * When false: fee is deferred to post-approval (legacy behavior).
     */
    collectFeeAtApply: envBool('SCHOLARSHIP_COLLECT_FEE_AT_APPLY', true),

    /*
     * Auto-refund window. When a rejected application is marked for
     * refund, admin has this many days to process it. After that, the
     * application is flagged in the admin dashboard as "refund overdue".
     */
    refundProcessingDeadlineDays: envInt(
      'SCHOLARSHIP_REFUND_DEADLINE_DAYS',
      3
    ),
  },

  /* ==========================================================================
   * NOTIFICATION TYPES
   * ========================================================================== */
  notifications: {
    scholarship_applied: { severity: 'info', category: 'scholarships', recipient: 'applicant' },
    scholarship_approved: { severity: 'success', category: 'scholarships', recipient: 'applicant' },
    scholarship_fee_due: { severity: 'info', category: 'scholarships', recipient: 'applicant' },
    scholarship_fee_paid: { severity: 'success', category: 'scholarships', recipient: 'applicant' },
    scholarship_rejected: { severity: 'critical', category: 'scholarships', recipient: 'applicant' },
    scholarship_revoked: { severity: 'warning', category: 'scholarships', recipient: 'applicant' },
    scholarship_withdrawn: { severity: 'info', category: 'scholarships', recipient: 'applicant' },
    scholarship_app_received: { severity: 'info', category: 'scholarships', recipient: 'admin' },
    scholarship_fee_deadline: { severity: 'warning', category: 'scholarships', recipient: 'applicant' },
  },

  /* ==========================================================================
   * PUBLIC LISTING BEHAVIOR
   * ========================================================================== */
  publicListing: {
    cacheSeconds: envInt('SCHOLARSHIP_PUBLIC_CACHE_SECONDS', 15),
    bannerDismissStorageDays: envInt(
      'SCHOLARSHIP_BANNER_DISMISS_DAYS',
      7
    ),
    maxBannerCampaigns: envInt('SCHOLARSHIP_BANNER_MAX_CAMPAIGNS', 1),
    showQuotaProgress: envBool('SCHOLARSHIP_SHOW_QUOTA', true),

    /*
     * Floating card — bottom-right persistent scholarship advertisement.
     *
     * Behavior:
     *   - enabled=false  → never renders (instant kill switch)
     *   - delayMs        → appearance delay after page load (soft onboarding)
     *   - dismissDays    → how long the X-close lasts (localStorage)
     *
     * Hidden automatically on:
     *   - Viewports < 768px (mobile too crowded)
     *   - /auth/* pages (ScholarshipBanner already shown there)
     *   - /admin/* pages (admins don't need marketing)
     */
    floatingCard: {
      enabled: envBool('SCHOLARSHIP_FLOATING_CARD_ENABLED', true),
      delayMs: envInt('SCHOLARSHIP_FLOATING_CARD_DELAY_MS', 3000),
      dismissDays: envInt('SCHOLARSHIP_FLOATING_CARD_DISMISS_DAYS', 7),
    },
  },

  /* ==========================================================================
   * ADMIN UX DEFAULTS
   * ========================================================================== */
  admin: {
    applicationsPerPage: envInt('SCHOLARSHIP_ADMIN_PAGE_SIZE', 25),
    allowApprovalBeyondQuota: envBool(
      'SCHOLARSHIP_ADMIN_OVERRIDE_QUOTA',
      false
    ),
    requireRejectionReason: envBool(
      'SCHOLARSHIP_REQUIRE_REJECTION_REASON',
      true
    ),
    allowRevocation: envBool('SCHOLARSHIP_ALLOW_REVOCATION', true),
    maskApplicantPhone: envBool('SCHOLARSHIP_MASK_PHONE', false),
  },

  /* ==========================================================================
   * REGISTRATION FEE PAYMENT FLOW
   * ========================================================================== */
  registrationFee: {
    paymentPurpose: 'scholarship_registration',
    paymentDeadlineDays: envInt('SCHOLARSHIP_FEE_DEADLINE_DAYS', 7),
    checkoutUrlTemplate: '/checkout?scholarship={applicationId}',
    allowPaymentRetry: envBool('SCHOLARSHIP_ALLOW_PAYMENT_RETRY', true),
  },

  /* ==========================================================================
   * DOCUMENT TYPES — THE PLATFORM-WIDE REGISTRY
   * ==========================================================================
   * Every document a campaign can request. Campaigns reference a subset
   * via their `required_documents` JSONB field. Validation rejects any
   * campaign that references a type NOT listed here.
   *
   * Each entry supports:
   *   labelKey        — i18n key (camelCase) for the human label
   *   defaultRequired — pre-check "required" when the admin adds it
   *   descriptionKey  — optional i18n key for a help tooltip
   *
   * To add a new type (e.g. passport): add an entry, add the matching
   * i18n label to scholarships.documents.<camelCaseKey>, restart.
   * ========================================================================== */
  documentTypes: {
    student_id: {
      labelKey: 'scholarships.documents.studentId',
      defaultRequired: true,
    },
    transcript: {
      labelKey: 'scholarships.documents.transcript',
      defaultRequired: false,
    },
    recommendation_letter: {
      labelKey: 'scholarships.documents.recommendationLetter',
      defaultRequired: false,
    },
    income_proof: {
      labelKey: 'scholarships.documents.incomeProof',
      defaultRequired: false,
    },
    national_id: {
      labelKey: 'scholarships.documents.nationalId',
      defaultRequired: true,
    },
    kebele_id_front: {
      labelKey: 'scholarships.documents.kebeleIdFront',
      defaultRequired: true,
    },
    kebele_id_back: {
      labelKey: 'scholarships.documents.kebeleIdBack',
      defaultRequired: true,
    },
    other: {
      labelKey: 'scholarships.documents.other',
      defaultRequired: false,
    },
  },

  /* ==========================================================================
   * ANALYTICS
   * ========================================================================== */
  analytics: {
    recentWindowDays: envInt('SCHOLARSHIP_ANALYTICS_WINDOW_DAYS', 30),
    minApplicationsForLeaderboard: envInt(
      'SCHOLARSHIP_ANALYTICS_MIN_APPS',
      5
    ),
  },

  /* ==========================================================================
   * LEARN MORE
   * ========================================================================== */
  learnMore: {
    maxContentChars: envInt('SCHOLARSHIP_LEARN_MORE_MAX_CHARS', 5000),
    maxUrlChars: envInt('SCHOLARSHIP_LEARN_MORE_MAX_URL', 500),
    enabled: envBool('SCHOLARSHIP_LEARN_MORE_ENABLED', true),
    contentRenderMode: envEnum(
      'SCHOLARSHIP_LEARN_MORE_RENDER',
      ['preformatted', 'paragraphs', 'markdown'],
      'paragraphs'
    ),
  },
};

module.exports = scholarshipsConfig;