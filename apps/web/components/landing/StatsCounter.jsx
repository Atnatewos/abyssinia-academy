/**
 * @fileoverview Stats Counter Component
 * Displays key platform statistics in a horizontal bar
 * Values from landing.config.js | Labels from i18n → t.landing.statsLabels[]
 * Path: apps/web/components/landing/StatsCounter.jsx
 */

import { useLanguage } from '../../context/LanguageContext';
import { getStatsConfig } from '../../lib/config';

const StatsCounter = () => {
  const { t } = useLanguage();

  /*
   * Stat values from landing config (numbers/short strings)
   * Labels from i18n translations (bilingual)
   */
  const configStats = getStatsConfig();
  const statsLabels = t.landing?.statsLabels || ['Structured System', 'Live Video Sessions', 'Lifetime Access'];

  return (
    <div className="stats-bar">
      {configStats.map((stat, index) => (
        <div key={index}>
          <p className="stats-value">{stat.value}</p>
          <p className="stats-label">{statsLabels[index] || ''}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;