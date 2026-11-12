/**
 * @fileoverview English — Pricing Page Namespace
 *
 * Covers the /pricing course catalog, per-course cards, featured course
 * selection, and the "explore more courses" CTA used on the landing page.
 *
 * Path: packages/shared/config/i18n/en/pricing.js
 */

module.exports = {
  pricing: {
    /* ── Page chrome ── */
    heading: 'Simple & Transparent Tuition',
    subheading: 'Choose the learning path that fits your goals.',
    tuitionEyebrow: 'Tuition',
    chooseCourse: 'Choose Your Course',
    chooseCourseSubtitle: 'Every course has its own price, curriculum, and phases.',

    /* ── Full course card ── */
    fullPass: 'Full Academy Access Pass',
    masterclass: 'Full-Stack Software Masterclass',
    instantAccess: 'Instant access to all 5 phases & course modules',
    hdPlaylists: 'HD pre-recorded video masterclasses',
    timestampsNotes: 'Timestamped session breakdowns & lecture notes',
    githubAssets: 'GitHub source code repositories & starter kits',
    telegramCommunity: 'Private Telegram developer mentorship community',
    enrollToday: 'Enroll Today & Start Learning',
    goToPortal: 'Go to Classroom Portal',
    bestValue: 'Best Value',
    savePercent: 'Save {percent}%',
    fullCourseLabel: 'Full Course',

    /* ── Phase selection ── */
    orBuildYourOwn: 'Or Build Your Own Path',
    selectIndividualPhases: 'Select individual phases at {price} {currency} each. Bulk discounts applied automatically.',
    customModeActive: 'Custom Mode Active',
    switchToCustom: 'Switch to Custom',
    addToCart: 'Add to Cart — {price} {currency}',
    removeFromCart: 'Remove from Cart',
    prerequisitesRequired: 'Prerequisites Required',
    lockedPrerequisiteMsg: 'Complete {prerequisites} first to unlock this phase.',
    andLabel: ' & Phase ',
    phaseLabel: 'Phase',
    phaseUnit: 'phase',
    phasesUnit: 'phases',
    weeksUnit: 'weeks',
    objectives: 'objectives',
    totalLabel: 'Total',
    offLabel: 'off',
    selectPhasesToContinue: 'Select phases to continue',
    selectAtLeastOne: 'Select at least one phase to continue',
    selected: 'Selected',

    /* ── Course catalog grid ── */
    courseGridEyebrow: 'Course Catalog',
    courseGridTitle: 'Explore Our Courses',
    courseGridSubtitle: 'Every course is a complete learning journey with its own price.',
    noCoursesTitle: 'No courses available yet',
    noCoursesSubtitle: 'Courses will appear here as soon as the admin publishes them.',
    perCourse: 'per course',

    /* ── Course card ── */
    courseCard: {
      mostPopular: 'Most Popular',
      featured: 'Featured',
      newBadge: 'New',
      enrollCta: 'Enroll Now',
      viewPhases: 'View Phases',
      startingFrom: 'Starting from',
      usesGlobalPricing: 'Uses global pricing',
      customPrice: 'Custom price',
      priceLabel: 'Price',
      weekCount: '{count} weeks',
      phaseCount: '{count} phases',
      level: 'Level',
      duration: 'Duration',
      viewDetails: 'View Details',

      /* Feature bullets shown on the catalog card */
      features: {
        lifetime: 'Lifetime access',
        certificate: 'Completion certificate',
        community: 'Private Telegram community',
        allPhases: 'All structured phases',
      },
    },

    /* ── Course count badge (landing footer of pricing) ── */
    exploreMore: {
      heading: 'Explore More Courses',
      subtitle: 'We have {count} courses available.',
      subtitleSingular: 'We have {count} course available.',
      cta: 'See All Courses',
      ariaLabel: 'Browse all {count} courses',
    },
  },
};