/**
 * @fileoverview Reseller Checkout Banner
 *
 * Rendered above the checkout summary whenever the buyer arrived through
 * a reseller link (?reseller=CODE). Shows "Sold by [name]" to reinforce
 * the reseller's brand, plus a subtle "Powered by Abyssinia Academy"
 * attribution so the buyer knows they're on the official platform.
 *
 * Path: apps/web/components/reseller/ResellerCheckoutBanner.jsx
 */

import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ResellerCheckoutBanner — Shows the reseller's name above checkout.
 *
 * @param {object} props
 * @param {object} props.resellerProfile - { displayName, code }
 */
const ResellerCheckoutBanner = ({ resellerProfile }) => {
  const { t } = useLanguage();

  if (!resellerProfile || !resellerProfile.displayName) return null;

  const soldByTemplate =
    t.reseller?.checkout?.soldBy || 'Sold by {name}';
  const poweredByText =
    t.reseller?.checkout?.poweredBy || 'Powered by Abyssinia Academy';

  const soldByText = soldByTemplate.replace(
    '{name}',
    resellerProfile.displayName
  );

  /* First letter for avatar */
  const initial = resellerProfile.displayName.charAt(0).toUpperCase();

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-xl"
      style={{
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex items-center justify-center shrink-0 w-10 h-10 rounded-lg font-bold text-sm"
          style={{
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#f59e0b',
          }}
        >
          {initial}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-bold truncate" style={{ color: '#f59e0b' }}>
            <UserCheck size={14} className="shrink-0" />
            {soldByText}
          </span>
          <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {resellerProfile.code}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium shrink-0" style={{ color: 'var(--text-dim)' }}>
        <Sparkles size={10} />
        <span>{poweredByText}</span>
      </div>
    </div>
  );
};

export default ResellerCheckoutBanner;