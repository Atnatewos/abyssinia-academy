/**
 * @fileoverview Social Proof Strip
 *
 * Thin live band under the hero: total paid to students + masked top
 * referrers. Data from /api/public/earn-stats (cached, gated, masked).
 * Renders nothing while loading, when gated off, or when totals are
 * too small to impress — never shows emptiness.
 *
 * Path: apps/web/components/landing/SocialProofStrip.jsx
 */
import React, { useEffect, useState } from 'react';
import { Banknote, Users, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSocialProofConfig } from '../../lib/config';

const SocialProofStrip = () => {
  const { t } = useLanguage();
  const labels = t.landing?.socialProof || {};
  const socialConfig = getSocialProofConfig();

  const [state, setState] = useState({ loading: true, enabled: false, data: null });

  useEffect(() => {
    if (!socialConfig.enabled) {
      setState({ loading: false, enabled: false, data: null });
      return;
    }

    let isMounted = true;
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/earn-stats');
        const payload = await response.json();
        if (!isMounted) return;
        if (payload.success && payload.data?.enabled) {
          setState({ loading: false, enabled: true, data: payload.data });
        } else {
          setState({ loading: false, enabled: false, data: null });
        }
      } catch {
        if (isMounted) setState({ loading: false, enabled: false, data: null });
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [socialConfig.enabled]);

  if (state.loading || !state.enabled || !state.data) return null;

  const { totalPaidETB, activeReferrers, topReferrers } = state.data;

  return (
    <div className="social-proof-strip" role="complementary" aria-label="Platform earnings proof">
      <span className="social-proof-item">
        <Banknote size={14} />
        <strong>{totalPaidETB.toLocaleString('en-US')} ETB</strong>
        {labels.paid || 'paid to students'}
      </span>
      <span className="social-proof-item">
        <Users size={14} />
        <strong>{activeReferrers.toLocaleString('en-US')}</strong>
        {labels.referrers || 'active referrers'}
      </span>
      {topReferrers.map((referrer) => (
        <span key={referrer.maskedName} className="social-proof-item">
          <Trophy size={14} />
          <strong>{referrer.maskedName}</strong>
          {referrer.referrals} {labels.refs || 'refs'}
        </span>
      ))}
    </div>
  );
};

export default SocialProofStrip;