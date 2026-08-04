/**
 * @fileoverview Hero Visual Card Component
 * Floating code editor card with play button and session list
 * Session data from landing.config.js | Display text from i18n → t.landing.heroVisual.*
 * Path: apps/web/components/landing/HeroVisual.jsx
 */

import React from 'react';
import Link from 'next/link';
import { Play, Video } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getHeroVisualConfig } from '../../lib/config';

/**
 * HeroVisual — Floating code editor preview card
 * Displays a simulated IDE window with session list
 * Structure from landing.config.js, text from i18n translations
 */
const HeroVisual = () => {
  const { t } = useLanguage();

  /*
   * Structure from landing config
   * Contains: filename, preview image URL, session times, active states
   */
  const visualConfig = getHeroVisualConfig();
  const filename = visualConfig.filename || 'Abyssinia_Masterclass.jsx';
  const previewImage = visualConfig.previewImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
  const previewDuration = visualConfig.previewDuration || '45:10';
  const sessions = visualConfig.sessions || [];

  /*
   * Display text from i18n translations
   * Supports any language — just add the keys to the language file
   */
  const landingI18n = t.landing?.heroVisual || {};
  const freePreviewLabel = landingI18n.freePreviewLabel || 'FREE PREVIEW';
  const previewDetail = landingI18n.previewDetail || 'Phase 1 · Week 1 · Class 01';
  const sessionTitles = landingI18n.sessions || [];

  return (
    <div className="hero-visual">
      <div className="hero-visual-card">
        {/* macOS-style title bar */}
        <div className="hero-visual-titlebar">
          <div className="hero-visual-dots">
            {/* <div className="hero-visual-dot red" />
            <div className="hero-visual-dot yellow" />
            <div className="hero-visual-dot green" /> */}
          </div>
          <span className="hero-visual-filename">{filename}</span>
        </div>

        {/* Preview image with play button overlay */}
        <div className="hero-visual-preview">
          <img src={previewImage} alt="Code editor preview" />
          <div className="hero-visual-preview-overlay">
            <Link href="/courses" className="hero-visual-play-btn">
              <Play />
            </Link>
          </div>
          <div className="hero-visual-info">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
              <Video size={14} style={{ color: 'var(--gold-400)' }} />
              {freePreviewLabel}: {previewDetail}
            </span>
            <span style={{ color: 'var(--gold-400)', fontFamily: 'var(--font-mono)' }}>
              {previewDuration}
            </span>
          </div>
        </div>

        {/* Session list — times from config, titles from i18n */}
        <div className="hero-visual-sessions">
          {sessions.map((session, index) => {
            const title = sessionTitles[index] || `Session ${index + 1}`;
            return (
              <div
                key={index}
                className={`hero-visual-session ${session.isActive ? 'active' : 'inactive'}`}
              >
                <span>&rsaquo; {title}</span>
                <span className="hero-visual-session-time">{session.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;