/**
 * @fileoverview Hero Visual Card Component
 * Floating code editor card with play button and session list
 * Path: apps/web/components/landing/HeroVisual.jsx
 */

import Link from 'next/link';
import { Play, Video } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const HeroVisual = () => {
  const { t } = useLanguage();

  return (
    <div className="hero-visual">
      <div className="hero-visual-card">
        <div className="hero-visual-titlebar">
          <div className="hero-visual-dots">
            <div className="hero-visual-dot red" />
            <div className="hero-visual-dot yellow" />
            <div className="hero-visual-dot green" />
          </div>
          <span className="hero-visual-filename">Abyssinia_Masterclass.jsx</span>
        </div>

        <div className="hero-visual-preview">
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
            alt="Code editor preview"
          />
          <div className="hero-visual-preview-overlay">
            <Link href="/courses" className="hero-visual-play-btn">
              <Play />
            </Link>
          </div>
          <div className="hero-visual-info">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
              <Video size={14} style={{ color: 'var(--gold-400)' }} />
              {t.courses?.freePreview || 'FREE PREVIEW'}: Phase 1 &middot; Week 1 &middot; Class 01
            </span>
            <span style={{ color: 'var(--gold-400)', fontFamily: 'var(--font-mono)' }}>45:10</span>
          </div>
        </div>

        <div className="hero-visual-sessions">
          <div className="hero-visual-session active">
            <span>&rsaquo; 01. Client-Server Architecture Overview</span>
            <span className="hero-visual-session-time">00:00</span>
          </div>
          <div className="hero-visual-session inactive">
            <span>&rsaquo; 02. HTML5 Semantic Elements Demystified</span>
            <span className="hero-visual-session-time">14:20</span>
          </div>
          <div className="hero-visual-session inactive">
            <span>&rsaquo; 03. Accessibility (a11y) Best Practices</span>
            <span className="hero-visual-session-time">30:15</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;