/**
 * @fileoverview Stats Counter Component
 * Displays key platform statistics in a horizontal bar
 * Path: apps/web/components/landing/StatsCounter.jsx
 */

import { useLanguage } from '../../context/LanguageContext';

const StatsCounter = () => {
  const { t } = useLanguage();

  const stats = [
    { value: t.stats?.phases || '5 Phases', label: t.stats?.phasesSub || 'Structured System' },
    { value: t.stats?.weeks || '20+ Weeks', label: t.stats?.weeksSub || 'Live Video Sessions' },
    { value: t.stats?.access || '100%', label: t.stats?.accessSub || 'Lifetime YouTube Access' },
  ];

  return (
    <div className="stats-bar">
      {stats.map((stat, index) => (
        <div key={index}>
          <p className="stats-value">{stat.value}</p>
          <p className="stats-label">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;