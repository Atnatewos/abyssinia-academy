/**
 * @fileoverview English — Phase Purchase Namespace
 * Path: packages/shared/config/i18n/en/phasePurchase.js
 */

module.exports = {
  phasePurchase: {
    selectMode: 'Choose Your Learning Path',
    selectModeSub: 'Buy the full course for maximum savings, or pick individual phases.',

    fullCourseOption: {
      label: 'Full Course',
      description: 'All 5 phases — best value',
    },

    individualPhasesOption: {
      label: 'Individual Phases',
      description: 'Pick specific phases you need',
    },

    phaseSelector: {
      title: 'Select Phases to Purchase',
      subtitle: 'Choose the phases you want to enroll in. You can always add more later.',
      noPrerequisites: 'No prerequisites',
      requiresLabel: 'Requires',
      prerequisiteLabel: 'Prerequisite',
      selectPhase: 'Select Phase',
      deselectPhase: 'Deselect Phase',
      lockedPhase: 'Locked — select prerequisites first',
    },

    cartSummary: {
      phasesSelected: '{count} phase(s) selected',
      baseTotal: 'Subtotal',
      bulkDiscount: 'Bulk Discount ({percent}%)',
      total: 'Total',
      perPhase: 'per phase',
      fullCourseNudge: 'Buy the full course for {price} ETB and save more!',
      fullCourseNudgeShort: 'Full course is only {price} ETB',
    },
  },
};