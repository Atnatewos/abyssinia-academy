/**
 * @fileoverview Countdown Banner Component
 * Sticky top banner with urgency countdown timer for pricing page
 * ALL content from i18n + config — zero hardcoded strings
 * Path: apps/web/components/pricing/CountdownBanner.jsx
 */

import React from 'react';
import { Clock } from 'lucide-react';
import useCountdownTimer from '../../hooks/useCountdownTimer';
import { useLanguage } from '../../context/LanguageContext';

/**
 * CountdownBanner — Sticky urgency banner for the pricing page
 * Displays a countdown timer with config-driven messages and colors
 */
const CountdownBanner = () => {
  const { language } = useLanguage();
  const timer = useCountdownTimer();

  /*
   * Don't render if timer is disabled or expired
   */
  if (!timer.isEnabled || timer.isExpired) return null;

  /*
   * Resolve the banner message based on language
   */
  const bannerMessage = (language === 'am'
    ? (timer.messages.pricingBannerAm || '⚡ የማስተዋወቂያ ቅናሽ በ {minutes}:{seconds} ያበቃል')
    : (timer.messages.pricingBanner || '⚡ Launch offer expires in {minutes}:{seconds}'))
    .replace('{minutes}', timer.formattedTime.minutes)
    .replace('{seconds}', timer.formattedTime.seconds);

  return (
    <div
      className="countdown-banner"
      style={{
        borderColor: timer.currentColor,
        background: `${timer.currentColor}0D`,
      }}
    >
      <div className="countdown-banner-inner">
        <span className="countdown-banner-icon" style={{ color: timer.currentColor }}>
          <Clock size={16} />
        </span>
        <span className="countdown-banner-text" style={{ color: timer.currentColor }}>
          {bannerMessage}
        </span>
        <div className="countdown-banner-progress">
          <div
            className="countdown-banner-progress-fill"
            style={{
              width: `${timer.percentRemaining}%`,
              background: timer.currentColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CountdownBanner;