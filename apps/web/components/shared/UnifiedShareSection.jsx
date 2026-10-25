/**
 * @fileoverview Unified Share Section
 *
 * A premium, combined share panel for both Referral and Agent codes.
 * Uses gradient borders and bold typography for the links.
 *
 * Path: apps/web/components/shared/UnifiedShareSection.jsx
 */

import React, { useState, useCallback } from 'react';
import { Copy, Check, Link as LinkIcon, Users, Briefcase, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CopyField = ({ value, label, icon: Icon, isLink = false }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [value]);

  return (
    <div className="mlm-share-field" style={{ marginBottom: '1rem' }}>
      <label className="mlm-share-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Icon size={14} /> {label}
      </label>
      <div className="mlm-share-input-row" style={{ 
        background: 'rgba(15, 23, 42, 0.6)', 
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem'
      }}>
        <span style={{ 
          flex: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontWeight: 700,
          color: 'var(--accent-gold)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9375rem',
          letterSpacing: '0.02em'
        }}>
          {value || '—'}
        </span>
        <button
          type="button"
          className="mlm-copy-btn"
          onClick={handleCopy}
          disabled={!value}
          style={{ width: '28px', height: '28px', borderRadius: '6px' }}
        >
          {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};

const UnifiedShareSection = ({ referralCode, referralLink, agentCode, agentLink }) => {
  const { t } = useLanguage();

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
      gap: '1.5rem',
      marginTop: '1rem'
    }}>
      
      {/* ── Referral Share Card (Gold Gradient) ── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(15,23,42,0.6) 100%)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: '1rem',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Users size={16} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            {t.referrals?.shareTitle || 'Network Referral'}
          </h3>
        </div>

        <CopyField value={referralCode} label={t.referrals?.yourCode || 'Referral Code'} icon={Share2} />
        <CopyField value={referralLink} label={t.referrals?.yourLink || 'Referral Link'} icon={LinkIcon} isLink />
        
        {/* Social Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink || '')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#229ED9', color: '#fff', padding: '0.5rem', borderRadius: '0.375rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>Telegram</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(referralLink || '')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', padding: '0.5rem', borderRadius: '0.375rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>WhatsApp</a>
        </div>
      </div>

      {/* ── Agent Share Card (Blue/Purple Gradient) ── */}
      {agentCode && (
        <div style={{
          background: 'linear-gradient(180deg, rgba(59,130,246,0.08) 0%, rgba(15,23,42,0.6) 100%)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: '1rem',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Briefcase size={16} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {t.agents?.shareTitle || 'Direct Agent Sales'}
            </h3>
          </div>

          <CopyField value={agentCode} label={t.agents?.yourAgentCode || 'Agent Code'} icon={Share2} />
          <CopyField value={agentLink} label={t.agents?.yourAgentLink || 'Agent Link'} icon={LinkIcon} isLink />
          
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: 1.5 }}>
            {t.agents?.shareSubtitle || 'Earn instant commissions when friends purchase through your link.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UnifiedShareSection;