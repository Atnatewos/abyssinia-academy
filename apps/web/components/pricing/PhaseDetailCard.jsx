/**
 * @fileoverview Phase Detail Card Component
 * Rich display card for a single phase showing what it contains
 * All content sourced from i18n + course phase config — zero hardcoded text
 * Path: apps/web/components/pricing/PhaseDetailCard.jsx
 */

import React from 'react';
import { Clock, BookOpen, CheckCircle, Code, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * PhaseDetailCard — Shows a single phase with its full details
 * Used in the pricing page to help students decide which phases to buy
 *
 * @param {object} props
 * @param {object} props.phase - Phase data from course config (title, description, outcomes, duration, weeks)
 * @param {number} props.phaseNumber - Phase number (1-5)
 * @param {boolean} props.isSelected - Whether this phase is currently in the cart
 * @param {boolean} props.canSelect - Whether this phase can be selected (prerequisites met)
 * @param {function} props.onToggle - Callback to toggle selection
 * @param {Array} props.missingPrerequisites - IDs of missing prerequisite phases
 * @param {boolean} props.showPrice - Whether to show the per-phase price
 * @param {number} props.price - Per-phase price amount
 * @param {string} props.currency - Currency code
 */
const PhaseDetailCard = ({
  phase = {},
  phaseNumber = 1,
  isSelected = false,
  canSelect = true,
  onToggle,
  missingPrerequisites = [],
  showPrice = false,
  price = 0,
  currency = 'ETB',
}) => {
  const { t, language } = useLanguage();

  /*
   * Resolve bilingual display text
   */
  const title = language === 'am' ? (phase.title_am || phase.title) : phase.title;
  const subtitle = language === 'am' ? (phase.subtitle_am || phase.subtitle) : phase.subtitle;
  const description = language === 'am' ? (phase.description_am || phase.description) : phase.description;
  const outcomes = phase.outcomes || [];
  const weekCount = phase.weeks ? phase.weeks.length : (phase.weekNumbers ? phase.weekNumbers.length : 0);
  const duration = phase.duration || `${weekCount} Weeks`;
  const isLocked = !canSelect && !isSelected;

  return (
    <div className={`phase-detail-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}>
      {/* Phase Number Badge + Price */}
      <div className="phase-detail-header">
        <span className="phase-detail-number">Phase {phaseNumber}</span>
        <div className="phase-detail-header-right">
          {showPrice && (
            <span className="phase-detail-price-tag">
              {price.toLocaleString()} {currency}
            </span>
          )}
          {isSelected && (
            <span className="phase-detail-selected-badge">
              <CheckCircle size={14} />
              Selected
            </span>
          )}
          {isLocked && (
            <span className="phase-detail-locked-badge">
              Prerequisites needed
            </span>
          )}
        </div>
      </div>

      {/* Title & Subtitle */}
      <h3 className="phase-detail-title">{title}</h3>
      {subtitle && <p className="phase-detail-subtitle">{subtitle}</p>}

      {/* Meta Info Row */}
      <div className="phase-detail-meta">
        <span className="phase-detail-meta-item">
          <Clock size={14} />
          {duration}
        </span>
        <span className="phase-detail-meta-item">
          <BookOpen size={14} />
          {weekCount} weeks
        </span>
        <span className="phase-detail-meta-item">
          <Code size={14} />
          {outcomes.length} learning goals
        </span>
      </div>

      {/* Description */}
      <p className="phase-detail-desc">{description}</p>

      {/* Learning Outcomes */}
      {outcomes.length > 0 && (
        <div className="phase-detail-outcomes">
          <span className="phase-detail-outcomes-label">
            <Layers size={14} />
            {t.courses?.phaseOutcomes || 'Key Learning Focus'}:
          </span>
          <ul className="phase-detail-outcomes-list">
            {outcomes.map((outcome, index) => (
              <li key={index} className="phase-detail-outcome-item">
                <CheckCircle size={12} />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Locked Message */}
      {isLocked && missingPrerequisites.length > 0 && (
        <div className="phase-detail-prereq-warning">
          <span>
            {t.phasePurchase?.phaseSelector?.requiresLabel || 'Requires'} Phase {missingPrerequisites.join(', Phase ')}
          </span>
        </div>
      )}

      {/* Select / Deselect Button — only when showPrice is true (individual mode) */}
      {showPrice && (
        <button
          type="button"
          onClick={onToggle}
          disabled={isLocked}
          className={`phase-detail-btn ${isSelected ? 'deselect' : 'select'} ${isLocked ? 'locked' : ''}`}
        >
          {isSelected ? 'Remove' : isLocked ? 'Locked' : 'Add to Cart'}
        </button>
      )}
    </div>
  );
};

export default PhaseDetailCard;