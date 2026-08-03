/**
 * @fileoverview Phase Selector Component
 * Checkbox list of phases with prerequisite validation and visual indicators
 * Path: apps/web/components/checkout/PhaseSelector.jsx
 */

import React from 'react';
import { Check, Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getPricing } from '../../lib/config';

/**
 * PhaseSelector — Checkbox grid for selecting individual phases
 * Shows prerequisite status, locks dependent phases, displays per-phase pricing
 *
 * @param {object} props
 * @param {Array} props.phases - Full phase objects with id, number, prerequisites
 * @param {Array} props.selectedPhases - Currently selected phase IDs
 * @param {function} props.onTogglePhase - Callback(phaseId) to toggle selection
 * @param {function} props.canSelectPhase - Callback(phaseId) returning { canSelect, missingPrerequisites }
 */
const PhaseSelector = ({ phases = [], selectedPhases = [], onTogglePhase, canSelectPhase }) => {
  const { t } = useLanguage();
  const pricing = getPricing();
  const perPhasePrice = pricing.perPhase?.amountETB || 1500;
  const currency = pricing.perPhase?.currency || 'ETB';

  if (phases.length === 0) {
    return (
      <div className="phase-selector-empty">
        <p>No phases available for selection.</p>
      </div>
    );
  }

  return (
    <div className="phase-selector">
      <div className="phase-selector-header">
        <h3>{t.phasePurchase?.phaseSelector?.title || 'Select Phases to Purchase'}</h3>
        <p>{t.phasePurchase?.phaseSelector?.subtitle || ''}</p>
      </div>

      <div className="phase-selector-list">
        {phases.map((phase) => {
          const isSelected = selectedPhases.includes(phase.id);
          const { canSelect, missingPrerequisites } = canSelectPhase(phase.id);
          const hasPrerequisites = phase.prerequisites && phase.prerequisites.length > 0;
          const isLocked = !canSelect && !isSelected;

          /*
           * Get prerequisite phase numbers for display
           */
          const prerequisiteNumbers = missingPrerequisites.map((prereqId) => {
            const prereqPhase = phases.find((p) => p.id === prereqId);
            return prereqPhase ? prereqPhase.number : prereqId;
          });

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => onTogglePhase(phase.id)}
              disabled={isLocked}
              className={`phase-selector-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
              aria-label={isSelected ? t.phasePurchase?.phaseSelector?.deselectPhase : t.phasePurchase?.phaseSelector?.selectPhase}
            >
              {/* Selection checkbox */}
              <div className={`phase-selector-checkbox ${isSelected ? 'checked' : ''}`}>
                {isSelected && <Check size={14} />}
                {isLocked && <Lock size={14} />}
              </div>

              {/* Phase info */}
              <div className="phase-selector-info">
                <div className="phase-selector-title-row">
                  <span className="phase-selector-number">Phase {phase.number}</span>
                  {hasPrerequisites && !isLocked && (
                    <span className="phase-selector-prereq-met">
                      <Check size={10} />
                    </span>
                  )}
                  {isLocked && (
                    <span className="phase-selector-prereq-locked">
                      <Lock size={10} />
                      <span>
                        {t.phasePurchase?.phaseSelector?.requiresLabel || 'Requires'}: {prerequisiteNumbers.map((n) => `Phase ${n}`).join(', ')}
                      </span>
                    </span>
                  )}
                </div>

                {!hasPrerequisites && !isSelected && (
                  <span className="phase-selector-no-prereq">
                    {t.phasePurchase?.phaseSelector?.noPrerequisites || 'No prerequisites'}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="phase-selector-price">
                <span className="phase-selector-price-amount">
                  {perPhasePrice.toLocaleString()} {currency}
                </span>
              </div>

              {/* Arrow indicator */}
              <ChevronRight size={16} className={`phase-selector-arrow ${isSelected ? 'rotated' : ''}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseSelector;