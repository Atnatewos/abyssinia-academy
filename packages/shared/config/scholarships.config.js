/**
 * @fileoverview Scholarship System Configuration
 *
 * Single source of truth for every scholarship-related business value in
 * the platform. Drives validation, defaults, lifecycle rules, fee handling,
 * notifications, admin UX, and the "learn more" content renderer.
 *
 * FEE MODEL
 * ─────────
 * Campaigns operate under the "pay at apply" model:
 *
 *   - A campaign with registration_fee_etb > 0 requires the applicant to
 *     submit payment proof as part of the application. Application and
 *     payment rows land atomically. There is no post-approval fee page.
 *   - An application with status 'pending' is awaiting payment
 *     verification by an admin. Once verified, it transitions to
 *     'payment_verified'.
 *   - An admin then makes a grant decision (approve or reject) on the
 *     'payment_verified' application. Approval grants the scholarship;
 *     rejection queues a refund.
 *
 * DOCUMENT TYPES
 * ──────────────
 * `documentTypes` is the platform-wide registry. Campaigns reference a
 * subset via their `required_documents` JSONB. Validation rejects any
 * reference to a type NOT in this registry.
 *
 * COMMISSION POLICY
 * ─────────────────
 * Scholarship fees are NOT sales. No MLM commission, agent commission,
 * reseller attribution, discount code usage, or credit consumption is
 * ever triggered by a `purpose = 'scholarship_registration'` payment.
 * Scholarship recipients are still eligible to be referrers and agents.
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
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
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
     * on `applications_open_at`. The admin form defaults open-at to "now"
     * — this can race the query by a fraction of a second. The grace
     * window makes a freshly created campaign immediately visible.
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
     * Under the "pay at apply" model, the fee is collected as part of the
     * application submission. This flag exists for clarity and is used by
     * service-layer assertions. Setting it to false would disable the
     * combined-insert path — not supported, kept to document the contract.
     */
    collectFeeAtApply: true,

    /*
     * The number of business days the admin has to process a refund once
     * it has been queued. Overdue refunds surface prominently on the
     * admin dashboard.
     */
    refundProcessingDeadlineDays: envInt(
      'SCHOLARSHIP_REFUND_DEADLINE_DAYS',
      3
    ),
  },

  /* ==========================================================================
   * NOTIFICATION TYPES (mirrored in packages/shared/config/notifications.config.js)
   * ========================================================================== */
  notifications: {
    scholarship_applied: { severity: 'info', category: 'scholarships', recipient: 'applicant' },
    scholarship_payment_verified: { severity: 'success', category: 'scholarships', recipient: 'applicant' },
    scholarship_approved: { severity: 'success', category: 'scholarships', recipient: 'applicant' },
    scholarship_rejected: { severity: 'critical', category: 'scholarships', recipient: 'applicant' },
    scholarship_refund_initiated: { severity: 'info', category: 'scholarships', recipient: 'applicant' },
    scholarship_refund_completed: { severity: 'success', category: 'scholarships', recipient: 'applicant' },
    scholarship_revoked: { severity: 'warning', category: 'scholarships', recipient: 'applicant' },
    scholarship_withdrawn: { severity: 'info', category: 'scholarships', recipient: 'applicant' },
    scholarship_app_received: { severity: 'info', category: 'scholarships', recipient: 'admin' },
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

    /*
     * Number of days an admin has to verify the payment on a 'pending'
     * application before it becomes eligible for auto-rejection by the
     * sweeper job. The applicant paid; they deserve a decision within a
     * bounded window.
     */
    paymentVerificationDeadlineDays: envInt(
      'SCHOLARSHIP_PAYMENT_VERIFY_DEADLINE_DAYS',
      7
    ),
  },

  /* ==========================================================================
   * REGISTRATION FEE PAYMENT FLOW
   * ========================================================================== */
  registrationFee: {
    paymentPurpose: 'scholarship_registration',
    checkoutUrlTemplate: '/scholarships/fee-pay?application={applicationId}',
    allowPaymentRetry: envBool('SCHOLARSHIP_ALLOW_PAYMENT_RETRY', true),
    requireScreenshot: envBool(
      'SCHOLARSHIP_FEE_REQUIRE_SCREENSHOT',
      true
    ),
    requireTransactionRef: envBool(
      'SCHOLARSHIP_FEE_REQUIRE_TX_REF',
      true
    ),
  },

  /* ==========================================================================
   * DOCUMENT TYPES — THE PLATFORM-WIDE REGISTRY
   * ==========================================================================
   * To add a new type (e.g. passport):
   *   1. Add an entry below (snake_case key)
   *   2. Add its label to i18n/<lang>/scholarships.js under
   *      `scholarships.documents.<camelCaseKey>`
   *   3. Restart the dev server — the new type shows up automatically in
   *      every admin create/edit form and student form
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