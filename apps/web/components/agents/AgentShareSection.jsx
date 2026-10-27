/**
 * @fileoverview Agent Share Section
 *
 * Displays the agent code and shareable link with copy buttons.
 * Mirrors MLMShareSection styling.
 *
 * Path: apps/web/components/agents/AgentShareSection.jsx
 */

import React, { useState, useCallback } from 'react';
import { Copy, Check, Link as LinkIcon, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CopyField = ({ value, label, icon: Icon }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      /* silent fallback */
    });
  }, [value]);

  return (
    <div className="mlm-share-field">
      <label className="mlm-share-label">{label}</label>
      <div className="mlm-share-input-row">
        <Icon size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
        <span className={Icon === UserCheck ? "mlm-share-code" : "mlm-share-link"}>
          {value || '—'}
        </span>
        <button
          type="button"
          className="mlm-copy-btn"
          onClick={handleCopy}
          disabled={!value}
          title={copied ? (t.agents?.copied || 'Copied!') : (t.agents?.copyCode || 'Copy')}
        >
          {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};

const AgentShareSection = ({ code, link }) => {
  const { t } = useLanguage();

  return (
    <div className="glass-card mlm-share-section" style={{ padding: '1.25rem' }}>
      <h3 className="mlm-section-title" style={{ marginBottom: '1rem' }}>
        {t.agents?.shareTitle || 'Share Your Agent Link'}
      </h3>
      
      <CopyField
        value={code}
        label={t.agents?.yourAgentCode || 'Your Agent Code'}
        icon={UserCheck}
      />
      <CopyField
        value={link}
        label={t.agents?.yourAgentLink || 'Your Agent Link'}
        icon={LinkIcon}
      />
      
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: 1.5 }}>
        {t.agents?.shareSubtitle || 'Earn instant commissions when friends purchase through your link.'}
      </p>
    </div>
  );
};

export default AgentShareSection;