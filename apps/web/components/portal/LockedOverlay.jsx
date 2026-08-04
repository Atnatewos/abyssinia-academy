/**
 * @fileoverview Locked Overlay Component
 * Displayed over video player for locked content
 * Shows contextual CTAs based on enrollment status:
 * - Not enrolled → "Unlock Full Pass" → /pricing
 * - Enrolled but phase locked → "Unlock Phase X" → /pricing
 * - Free preview accessible → never shows overlay
 * 
 * Path: apps/web/components/portal/LockedOverlay.jsx
 */

import Link from 'next/link';
import { Lock, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

/**
 * LockedOverlay - Access control gate for locked video content
 * 
 * @param {object} props
 * @param {string} [props.lockedPhaseNumber] - Phase number of the locked lesson (for contextual CTA)
 * @param {string} [props.lockedPhaseTitle] - Phase title for display
 */
const LockedOverlay = ({ lockedPhaseNumber = null, lockedPhaseTitle = null }) => {
  const { t } = useLanguage();
  const { isEnrolled } = useAuth();

  /*
   * Determine the CTA message based on enrollment context
   * Enrolled students see phase-specific purchase CTAs
   * Non-enrolled students see the general unlock CTA
   */
  const getTitle = () => {
    if (isEnrolled && lockedPhaseNumber) {
      return (t.portal?.lockedPhaseTitle || 'Phase {phase} is Locked')
        .replace('{phase}', lockedPhaseNumber);
    }
    return t.portal?.lockedTitle || 'This Class is Locked';
  };

  const getDescription = () => {
    if (isEnrolled && lockedPhaseNumber) {
      const baseMsg = t.portal?.lockedPhaseDescription ||
        'Purchase Phase {phase}{title} to unlock this content and continue your learning journey.';
      const titleSuffix = lockedPhaseTitle ? `: ${lockedPhaseTitle}` : '';
      return baseMsg
        .replace('{phase}', lockedPhaseNumber)
        .replace('{title}', titleSuffix);
    }
    return t.portal?.lockedDescription || 'Complete your enrollment to unlock all courses and start learning today.';
  };

  const getButtonText = () => {
    if (isEnrolled && lockedPhaseNumber) {
      return (t.portal?.unlockPhase || 'Unlock Phase {phase}')
        .replace('{phase}', lockedPhaseNumber);
    }
    return t.hero?.unlockAccess || 'Unlock Full Pass';
  };

  return (
    <div className="video-locked-overlay">
      <div className="video-locked-icon">
        <Lock />
      </div>
      <h3 className="video-locked-title">{getTitle()}</h3>
      <p className="video-locked-desc">{getDescription()}</p>
      <Link href="/pricing" className="video-locked-btn">
        <ShoppingCart size={16} />
        <span>{getButtonText()}</span>
      </Link>
    </div>
  );
};

export default LockedOverlay;