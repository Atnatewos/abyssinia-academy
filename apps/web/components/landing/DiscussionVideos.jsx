/**
 * @fileoverview Discussion Videos — Equal Card Grid
 * Same card grid layout as pricing cards. Click opens YouTube embed modal.
 * Thumbnails auto-generated from YouTube video IDs.
 * All videos from landing.config.js — accepts full URLs or plain IDs.
 * All videos are PUBLIC (marketing content, no auth required).
 * 
 * Path: apps/web/components/landing/DiscussionVideos.jsx
 */

import { useState, useCallback } from 'react';
import { Play, X, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getLandingConfig } from '../../lib/config';

/**
 * Extract the YouTube video ID from a full URL or plain ID.
 * Supports all YouTube URL formats.
 * 
 * @param {string} input - Full YouTube URL or plain video ID
 * @returns {string} YouTube video ID
 */
const extractYouTubeId = (input) => {
  if (!input) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  return input;
};

/**
 * Get the YouTube thumbnail URL for a video ID.
 * Uses the high-quality default thumbnail (hqdefault.jpg).
 * Falls back through multiple thumbnail sizes.
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {string} Thumbnail URL
 */
const getThumbnailUrl = (videoId) => {
  if (!videoId) return '';
  /*
   * YouTube thumbnail sizes:
   * - default.jpg (120x90)
   * - mqdefault.jpg (320x180)  
   * - hqdefault.jpg (480x360)
   * - sddefault.jpg (640x480)
   * - maxresdefault.jpg (1280x720)
   * hqdefault is most reliable — always available
   */
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * DiscussionVideos — Equal grid of video cards, matching the pricing card layout.
 */
const DiscussionVideos = () => {
  const { t } = useLanguage();
  const landingConfig = getLandingConfig();
  const rawVideos = landingConfig.discussionVideos || [];

  /*
   * Process videos: extract YouTube IDs and generate thumbnails
   */
  const videos = rawVideos.map((video) => {
    const youtubeId = extractYouTubeId(video.youtubeId);
    return {
      ...video,
      youtubeId,
      thumbnail: video.thumbnail || getThumbnailUrl(youtubeId),
    };
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalVideoId, setModalVideoId] = useState(null);

  if (videos.length === 0) return null;

  /**
   * Open the video modal
   */
  const handleOpenModal = (youtubeId) => {
    setModalVideoId(youtubeId);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  /**
   * Close the video modal
   */
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalVideoId(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <section className="landing-pricing-3d">
        <div className="landing-pricing-header">
          <span className="landing-pricing-eyebrow">
            {t.landing?.discussions?.eyebrow || 'Inside the Classroom'}
          </span>
          <h2 className="landing-pricing-title">
            {t.landing?.discussions?.title || 'Live Discussions & Q&A'}
          </h2>
          <p className="landing-pricing-subtitle">
            {t.landing?.discussions?.subtitle || 'Real discussions. Real mentorship. Real community.'}
          </p>
        </div>

        {/* ── Equal Card Grid — same layout as pricing cards ── */}
        <div className="landing-pricing-equal-grid">
          {videos.map((video, index) => (
            <div
              key={index}
              className="landing-pricing-equal-card"
              style={{
                '--card-accent-border': 'rgba(239, 68, 68, 0.3)',
                '--card-accent-color': '#ef4444',
                '--card-accent-bg': 'rgba(239, 68, 68, 0.06)',
                cursor: 'pointer',
              }}
              onClick={() => handleOpenModal(video.youtubeId)}
            >
              {/* ── Thumbnail ── */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                  background: '#000',
                }}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.7,
                    transition: 'opacity 0.3s ease',
                  }}
                  onError={(e) => {
                    /*
                     * Fallback: if hqdefault fails, try mqdefault
                     */
                    const videoId = extractYouTubeId(video.youtubeId);
                    if (videoId && !e.target.src.includes('mqdefault')) {
                      e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                    }
                  }}
                />
                {/* Play Button Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div className="landing-discussion-play">
                    <Play size={20} fill="#0f172a" />
                  </div>
                </div>
              </div>

              {/* ── Title ── */}
              <h3
                className="landing-pricing-equal-title"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {video.title}
              </h3>

              {/* ── Duration ── */}
              {video.duration && (
                <p
                  className="landing-pricing-equal-subtitle"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Clock size={12} />
                  {video.duration}
                </p>
              )}

              {/* Spacer to push CTA to bottom */}
              <div style={{ flex: 1 }} />

              {/* ── CTA ── */}
              <div
                className="landing-pricing-equal-cta"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                }}
              >
                <Play size={14} />
                <span>{t.landing?.discussions?.watchNow || 'Watch Now'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Video Modal ── */}
      {modalOpen && modalVideoId && (
        <div className="discussion-modal-overlay" onClick={handleCloseModal}>
          <div className="discussion-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="discussion-modal-close" onClick={handleCloseModal} aria-label="Close video">
              <X size={18} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${modalVideoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Discussion Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DiscussionVideos;