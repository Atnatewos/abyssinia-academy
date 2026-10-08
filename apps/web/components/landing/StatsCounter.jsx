/**
 * @fileoverview Stats Counter Component
 *
 * Renders the hero stats bar. Entries with a `source` pointer derive their
 * value live from referrals/withdrawal config so marketing numbers never
 * drift from the business model:
 *   - 'referrals.totalPerSale'      → '{amount} ETB'
 *   - 'referrals.processingTimeHours' → '{hours}h'
 *
 * Path: apps/web/components/landing/StatsCounter.jsx
 */
import { useLanguage } from '../../context/LanguageContext';
import {
  getStatsConfig,
  getCommissionStructure,
  getWithdrawalConfig,
} from '../../lib/config';

/**
 * Resolve a stat value: static config string or derived from referrals.
 * @param {object} stat - Stat config entry
 * @param {object} commissionConfig
 * @param {object} withdrawalConfig
 * @returns {string}
 */
const resolveStatValue = (stat, commissionConfig, withdrawalConfig) => {
  if (stat.value) return stat.value;
  if (stat.source === 'referrals.totalPerSale') {
    const total = commissionConfig?.totalPerSale || 0;
    return `${total.toLocaleString('en-US')} ETB`;
  }
  if (stat.source === 'referrals.processingTimeHours') {
    const hours = withdrawalConfig?.processingTimeHours || 48;
    return `${hours}h`;
  }
  return '';
};

const StatsCounter = () => {
  const { t } = useLanguage();
  const configStats = getStatsConfig();
  const commissionConfig = getCommissionStructure();
  const withdrawalConfig = getWithdrawalConfig();
  const statsLabels = t.landing?.statsLabels || [];

  return (
    <div className="stats-bar stats-bar-five">
      {configStats.map((stat, index) => (
        <div key={`stat-${index}`}>
          <p className="stats-value">
            {resolveStatValue(stat, commissionConfig, withdrawalConfig)}
          </p>
          <p className="stats-label">{statsLabels[index] || ''}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;