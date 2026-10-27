/**
 * @fileoverview MLM Share Section
 *
 * Compact referral code + link display with copy-to-clipboard
 * and social share buttons. Reads share config from shared package.
 * Uses the ToastContext API: toast.success() / toast.error().
 *
 * Path: apps/web/components/referral/MLMShareSection.jsx
 */

import React, { useState, useMemo } from 'react';
import { Copy, Check, Send, MessageCircle, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getReferralShareConfig, getPlatformConfig } from '../../lib/config';

const MLMShareSection = ({ code, link }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [copiedField, setCopiedField] = useState(null);

  const shareConfig = useMemo(() => getReferralShareConfig(), []);
  const platformConfig = useMemo(() => getPlatformConfig(), []);
  const platformName = platformConfig.name || 'Abyssinia Academy';

  const shareMessage = useMemo(() => {
    const template = shareConfig.shareMessageTemplate || '';
    return template
      .replace('{name}', platformName)
      .replace('{link}', link || '');
  }, [shareConfig, platformName, link]);

  const shareLinks = useMemo(() => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(link || '');
    const platforms = shareConfig.platforms || {};
    return {
      telegram: `${platforms.telegram || 'https://t.me/share/url'}?url=${encodedUrl}&text=${encodedMessage}`,
      whatsapp: `${platforms.whatsapp || 'https://wa.me'}?text=${encodedMessage}`,
      facebook: `${platforms.facebook || 'https://www.facebook.com/sharer/sharer.php'}?u=${encodedUrl}`,
    };
  }, [shareMessage, link, shareConfig]);

  /**
   * Copies text to clipboard and shows a toast confirmation.
   * @param {string} text - Text to copy
   * @param {string} field - Field identifier for UI state
   */
  const handleCopy = async (text, field) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(t.referrals?.mlm?.share?.copied || 'Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(t.referrals?.mlm?.share?.copyFailed || 'Failed to copy');
    }
  };

  const socialButtons = [
    { id: 'telegram', icon: Send, label: 'Telegram', href: shareLinks.telegram, color: '#0088cc' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', href: shareLinks.whatsapp, color: '#25d366' },
    { id: 'facebook', icon: Share2, label: 'Facebook', href: shareLinks.facebook, color: '#1877f2' },
  ];

  return (
    <div className="glass-card mlm-share-section">
      <h3 className="mlm-section-title">
        {t.referrals?.mlm?.share?.title || 'Share Your Referral Link'}
      </h3>

      <div className="mlm-share-field">
        <div className="mlm-share-input-row">
          <code className="mlm-share-code">{code || '—'}</code>
          <button
            type="button"
            className="mlm-copy-btn"
            onClick={() => handleCopy(code, 'code')}
            aria-label={t.referrals?.mlm?.share?.copyCode || 'Copy code'}
          >
            {copiedField === 'code' ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="mlm-share-field">
        <div className="mlm-share-input-row">
          <span className="mlm-share-link">{link || '—'}</span>
          <button
            type="button"
            className="mlm-copy-btn"
            onClick={() => handleCopy(link, 'link')}
            aria-label={t.referrals?.mlm?.share?.copyLink || 'Copy link'}
          >
            {copiedField === 'link' ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="mlm-share-buttons">
        {socialButtons.map((btn) => {
          const IconComponent = btn.icon;
          return (
            <a
              key={btn.id}
              href={btn.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mlm-share-btn"
              style={{ backgroundColor: btn.color }}
            >
              <IconComponent size={16} />
              <span>{btn.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MLMShareSection;