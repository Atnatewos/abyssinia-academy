/**
 * @fileoverview Discussion Videos — Equal Card Grid
 * Same card grid layout as pricing cards. Click opens YouTube embed modal
 * or opens in a new tab. Thumbnails auto-generated from YouTube video IDs.
 * Fetches videos from /api/discussions/list (database-driven).
 * All videos are PUBLIC (marketing content, no auth required).
 * 
 * Path: apps/web/components/landing/DiscussionVideos.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { Play, X, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
 * Uses hqdefault.jpg with mqdefault.jpg fallback.
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {string} Thumbnail URL
 */
const getThumbnailUrl = (videoId) => {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Build a full YouTube watch URL from a video ID.
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {string} Full YouTube watch URL
 */
const getYouTubeUrl = (videoId) => {
  if (!videoId) return '#';
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * DiscussionVideos — Equal grid of video cards, matching the pricing card layout.
 * Fetches videos from the database via public API.
 */
const DiscussionVideos = () => {
  const { t } = useLanguage();

  const [videos, setVideos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVideoId, setModalVideoId] = useState(null);

  /*
   * Fetch discussion videos from the public API
   */
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/discussions/list');
        const data = await response.json();
        if (data.success) {
          const processed = (data.data || []).map((v) => {
            const youtubeId = extractYouTubeId(v.youtube_id);
            return {
              ...v,
              youtubeId,
              thumbnail: v.thumbnail || getThumbnailUrl(youtubeId),
            };
          });
          setVideos(processed);
        }
      } catch {
        setVideos([]);
      }
    };
    fetchVideos();
  }, []);

  if (videos.length === 0) return null;

  /**
   * Open the video modal (plays embedded on site)
   */
  const handleOpenModal = (youtubeId, e) => {
    e.stopPropagation();
    setModalVideoId(youtubeId);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  /**
   * Open the video in a new YouTube tab
   */
  const handleOpenNewTab = (youtubeId, e) => {
    e.stopPropagation();
    window.open(getYouTubeUrl(youtubeId), '_blank', 'noopener,noreferrer');
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
              key={video.id || index}
              className="landing-pricing-equal-card"
              style={{
                '--card-accent-border': 'rgba(239, 68, 68, 0.3)',
                '--card-accent-color': '#ef4444',
                '--card-accent-bg': 'rgba(239, 68, 68, 0.06)',
                cursor: 'pointer',
              }}
            >
              {/* ── Thumbnail — click opens modal ── */}
              <div
                onClick={(e) => handleOpenModal(video.youtubeId, e)}
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
                    const vidId = extractYouTubeId(video.youtubeId || video.youtube_id);
                    if (vidId && !e.target.src.includes('mqdefault')) {
                      e.target.src = `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
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
                    transition: 'background 0.3s ease',
                  }}
                  className="video-thumb-overlay"
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

              {/* Spacer to push buttons to bottom */}
              <div style={{ flex: 1 }} />

              {/* ── Action Buttons ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Watch Now — opens modal */}
                <button
                  className="landing-pricing-equal-cta"
                  style={{
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                  }}
                  onClick={(e) => handleOpenModal(video.youtubeId, e)}
                >
                  <Play size={14} />
                  <span>{t.landing?.discussions?.watchNow || 'Watch Now'}</span>
                </button>

                {/* Open in YouTube — new tab */}
                <button
                  className="landing-pricing-equal-cta"
                  style={{
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    padding: '0.5rem 1rem',
                  }}
                  onClick={(e) => handleOpenNewTab(video.youtubeId, e)}
                >
                  <ExternalLink size={13} />
                  <span>{t.landing?.discussions?.openInYouTube || 'Open in YouTube'}</span>
                </button>
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