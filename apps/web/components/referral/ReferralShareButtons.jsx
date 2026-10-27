/**
 * @fileoverview Referral Share Buttons Component
 * Renders sharing buttons for Telegram, WhatsApp, Facebook, and copy.
 * ALL platforms from config → getSharingPlatforms()
 * ALL display text from i18n → t.referrals.*
 * Path: apps/web/components/referral/ReferralShareButtons.jsx
 */

import React, { useMemo } from 'react';
import { Copy, Send, MessageCircle, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSharingPlatforms, getReferralConfig } from '../../lib/config';

/*
 * Icon mapping for platform icon names from config
 */
const ICON_MAP = {
  Copy,
  Send,
  MessageCircle,
  Facebook: Share2,
};

/**
 * ReferralShareButtons — Platform-specific sharing buttons.
 *
 * @param {object} props
 * @param {string} props.link - The full referral link to share
 * @param {number} props.discountPercent - Current discount percentage
 */
const ReferralShareButtons = ({ link = '', discountPercent = 10 }) => {
  const { t, language } = useLanguage();

  /*
   * Get sharing platforms from config
   */
  const platforms = useMemo(() => getSharingPlatforms(), []);
  const referralConfig = useMemo(() => getReferralConfig(), []);

  /*
   * Build the share message
   */
  const shareMessage = useMemo(() => {
    const template = language === 'am'
      ? (referralConfig.sharing?.shareMessageAm || t.referrals?.shareMessageAm || '')
      : (referralConfig.sharing?.shareMessage || t.referrals?.shareMessage || '');

    return template.replace('{discount}', String(discountPercent));
  }, [language, referralConfig, t, discountPercent]);

  /**
   * Handle sharing to a specific platform
   */
  const handleShare = (platform) => {
    if (platform.id === 'copy') {
      navigator.clipboard.writeText(link).catch(() => {});
      return;
    }

    if (platform.url) {
      const shareUrl = platform.url
        .replace('{link}', encodeURIComponent(link))
        .replace('{message}', encodeURIComponent(shareMessage));

      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (platforms.length === 0) {
    return null;
  }

  return (
    <div className="referral-share-buttons">
      <span className="referral-share-label">
        {t.referrals?.shareTitle || 'Share & Earn'}
      </span>

      <div className="referral-share-grid">
        {platforms.map((platform) => {
          const IconComponent = ICON_MAP[platform.icon] || Share2;
          const label = language === 'am'
            ? (platform.labelAm || platform.label)
            : platform.label;

          return (
            <button
              key={platform.id}
              onClick={() => handleShare(platform)}
              className="referral-share-btn"
              title={label}
            >
              <IconComponent size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReferralShareButtons;