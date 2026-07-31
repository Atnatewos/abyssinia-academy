/**
 * @fileoverview Locked Overlay Component
 * Displayed over video player for non-enrolled users
 * Path: apps/web/components/portal/LockedOverlay.jsx
 */

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LockedOverlay = () => {
  const { t } = useLanguage();

  return (
    <div className="video-locked-overlay">
      <div className="video-locked-icon"><Lock /></div>
      <h3 className="video-locked-title">{t.portal?.lockedTitle || 'This Unlisted Class is Locked'}</h3>
      <p className="video-locked-desc">{t.portal?.lockedDescription || 'Complete your enrollment to unlock all courses.'}</p>
      <Link href="/pricing" className="video-locked-btn">
        {t.hero?.unlockAccess || 'Unlock Full Pass'}
      </Link>
    </div>
  );
};

export default LockedOverlay;