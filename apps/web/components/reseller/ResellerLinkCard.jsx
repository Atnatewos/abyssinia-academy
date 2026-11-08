/**
 * @fileoverview Reseller Link Card
 *
 * Shows the reseller's unique code and shareable link, each with a
 * copy button. Includes one-click share buttons for the three
 * major platforms (Telegram, WhatsApp, Facebook).
 *
 * The base URL is auto-detected from window.location.origin so the
 * component works in dev, staging, and prod without config changes.
 *
 * Path: apps/web/components/reseller/ResellerLinkCard.jsx
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, UserCheck, Link as LinkIcon, Send, MessageCircle, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

/**
 * CopyField — A labeled, copyable field.
 */
const CopyField = ({ value, label, icon: Icon, isCode }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t.reseller?.store?.copied || 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t.common?.copyFailed || 'Failed to copy');
    }
  }, [value, t, toast]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-2xs font-bold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg-input border border-border-medium">
        <Icon size={14} className="text-text-dim shrink-0" />
        <span
          className={
            isCode
              ? 'flex-1 font-mono text-sm font-extrabold text-accent tracking-wider'
              : 'flex-1 text-xs text-text-muted truncate'
          }
        >
          {value || '—'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-text-inverse transition-colors disabled:opacity-30"
          title={copied ? 'Copied!' : 'Copy'}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
};

/**
 * ResellerLinkCard — Displays code + link + share buttons.
 *
 * @param {object} props
 * @param {string} props.code - Reseller code (RES-XXXX)
 */
const ResellerLinkCard = ({ code }) => {
  const { t, language } = useLanguage();
  const toast = useToast();

  /* Auto-detect domain from browser */
  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  const link = code && baseUrl ? `${baseUrl}/pricing?reseller=${code}` : '';

  const shareMessage = useMemo(() => {
    const template =
      language === 'am'
        ? t.reseller?.store?.shareMessageAm
        : t.reseller?.store?.shareMessage;
    const fallback =
      'Join me at Abyssinia Academy and learn Full-Stack Web Development! {link}';
    return (template || fallback).replace('{link}', link);
  }, [link, language, t]);

  const shareLinks = useMemo(() => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(link);
    return {
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
      whatsapp: `https://wa.me?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };
  }, [shareMessage, link]);

  const shareButtons = [
    { id: 'telegram', icon: Send, label: 'Telegram', color: '#0088cc' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: '#25d366' },
    { id: 'facebook', icon: Share2, label: 'Facebook', color: '#1877f2' },
  ];

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-bg-card-solid border border-border-light">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-text-main">
          {t.reseller?.store?.linkLabel || 'Your Reseller Link'}
        </span>
        <span className="text-xs text-text-muted">
          {t.reseller?.store?.shareSubtitle ||
            'Share this link — anyone who buys through it earns you commission.'}
        </span>
      </div>

      <CopyField
        value={code}
        label={t.reseller?.store?.codeLabel || 'Your Code'}
        icon={UserCheck}
        isCode
      />

      <CopyField
        value={link}
        label={t.reseller?.store?.urlLabel || 'Your Link'}
        icon={LinkIcon}
      />

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-2xs text-text-dim font-semibold uppercase tracking-wider">
          {t.common?.share || 'Share'}:
        </span>
        {shareButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => {
                if (!link) {
                  toast.error(t.common?.copyFailed || 'No link to share yet.');
                  return;
                }
                window.open(shareLinks[btn.id], '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-text-inverse transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: btn.color }}
            >
              <Icon size={12} />
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ResellerLinkCard;