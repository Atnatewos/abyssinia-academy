/**
 * @fileoverview Referral Code Card Component
 * Displays the user's referral code with copy buttons for both code and link.
 * ALL display text from i18n → t.referrals.*
 * Shows a "generating" state when no code is available yet.
 * Path: apps/web/components/referral/ReferralCodeCard.jsx
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Share2, Loader, Link2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../lib/api';

/**
 * ReferralCodeCard — Shows the user's unique referral code and sharing tools.
 * If no code is provided, it fetches/generates one automatically.
 *
 * @param {object} props
 * @param {string} props.code - The user's referral code (may be empty initially)
 * @param {string} props.link - The full referral link (may be empty initially)
 * @param {number} props.discountPercent - Current discount percentage for referred users
 */
const ReferralCodeCard = ({ code: initialCode = '', link: initialLink = '', discountPercent = 10 }) => {
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [link, setLink] = useState(initialLink);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  /*
   * If no code was passed from parent, fetch it from the API
   */
  useEffect(() => {
    if (!initialCode) {
      const fetchCode = async () => {
        setGenerating(true);
        setGenerateError(null);

        try {
          const response = await apiClient.get('/referrals/code');

          if (response && response.success && response.data) {
            setCode(response.data.code);
            setLink(response.data.link);
          } else {
            setGenerateError('Failed to generate referral code.');
          }
        } catch (err) {
          console.error('Failed to fetch referral code:', err);
          setGenerateError('Unable to generate referral code. Please try again.');
        } finally {
          setGenerating(false);
        }
      };

      fetchCode();
    }
  }, [initialCode]);

  /**
   * Copy text to clipboard with fallback
   * @param {string} text - Text to copy
   * @param {function} setStateFn - State setter for the copied indicator
   */
  const copyToClipboard = useCallback(async (text, setStateFn) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setStateFn(true);
      setTimeout(() => setStateFn(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setStateFn(true);
        setTimeout(() => setStateFn(false), 2000);
      } catch {
        /* silent */
      }
      document.body.removeChild(textArea);
    }
  }, []);

  /**
   * Copy the referral code to clipboard
   */
  const handleCopyCode = useCallback(() => {
    copyToClipboard(code, setCopiedCode);
  }, [code, copyToClipboard]);

  /**
   * Copy the referral link to clipboard
   */
  const handleCopyLink = useCallback(() => {
    copyToClipboard(link, setCopiedLink);
  }, [link, copyToClipboard]);

  return (
    <div className="referral-code-card">
      <div className="referral-code-card-header">
        <Share2 size={18} />
        <h3 className="referral-code-card-title">
          {t.referrals?.yourCode || 'Your Referral Code'}
        </h3>
      </div>

      <p className="referral-code-card-subtitle">
        {(t.referrals?.shareSubtitle || 'Share your link to earn {percent}% credit per referral!')
          .replace('{percent}', String(discountPercent))}
      </p>

      {/* Generating State */}
      {generating && (
        <div className="referral-code-display" style={{ justifyContent: 'center', opacity: 0.6 }}>
          <Loader size={16} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Generating your code...</span>
        </div>
      )}

      {/* Error State */}
      {generateError && !generating && (
        <div className="referral-code-display" style={{ justifyContent: 'center', borderColor: 'rgba(239,68,68,0.2)' }}>
          <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{generateError}</span>
        </div>
      )}

      {/* Code Display */}
      {!generating && !generateError && code && (
        <>
          {/* Code Row with Copy Button */}
          <div className="referral-code-display">
            <span className="referral-code-text">{code}</span>
            <button
              onClick={handleCopyCode}
              className="referral-code-copy-btn"
              title={t.referrals?.shareCopyLink || 'Copy Code'}
            >
              {copiedCode ? (
                <>
                  <Check size={16} />
                  <span>{t.referrals?.copied || 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>{t.referrals?.shareCopyLink || 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Link Row with Copy Button */}
          {link && (
            <div className="referral-link-display">
              <div className="referral-link-row">
                <Link2 size={14} className="referral-link-icon" />
                <span className="referral-link-text">{link}</span>
                <button
                  onClick={handleCopyLink}
                  className="referral-link-copy-btn"
                  title={t.referrals?.shareCopyLink || 'Copy Link'}
                >
                  {copiedLink ? (
                    <Check size={14} style={{ color: '#10b981' }} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReferralCodeCard;