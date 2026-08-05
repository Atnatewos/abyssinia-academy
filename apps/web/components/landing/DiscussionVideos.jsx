/**
 * @fileoverview Discussion Videos — 3D Cinema Wall
 * Curved carousel of teacher-student discussion recordings.
 * Video URLs from landing.config.js — zero hardcoded values.
 * All videos are PUBLIC (marketing content, no auth required).
 * 
 * Path: apps/web/components/landing/DiscussionVideos.jsx
 */

import { useState, useCallback } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getLandingConfig } from '../../lib/config';

/**
 * DiscussionVideos — 3D curved video carousel with YouTube embed modal.
 */
const DiscussionVideos = () => {
  const { t } = useLanguage();
  const landingConfig = getLandingConfig();
  const videos = landingConfig.discussionVideos || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVideoId, setModalVideoId] = useState(null);

  if (videos.length === 0) return null;

  const totalVideos = videos.length;

  /**
   * Navigate to previous video in carousel
   */
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalVideos) % totalVideos);
  }, [totalVideos]);

  /**
   * Navigate to next video in carousel
   */
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalVideos);
  }, [totalVideos]);

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

  /**
   * Get the visual position for a card relative to the active index
   */
  const getCardPosition = (index) => {
    if (index === activeIndex) return 'center';
    const prev = (activeIndex - 1 + totalVideos) % totalVideos;
    const next = (activeIndex + 1) % totalVideos;
    if (index === prev || index === next) return 'side';
    return 'hidden';
  };

  return (
    <>
      <section className="landing-discussions-3d">
        <div className="landing-discussions-header">
          <span className="landing-pricing-eyebrow">
            {t.landing?.discussions?.eyebrow || 'Inside the Classroom'}
          </span>
          <h2 className="landing-discussions-title">
            {t.landing?.discussions?.title || 'Live Discussions & Q&A'}
          </h2>
          <p className="landing-discussions-subtitle">
            {t.landing?.discussions?.subtitle || 'Real discussions. Real mentorship. Real community.'}
          </p>
        </div>

        <div className="landing-discussions-wall">
          {videos.map((video, index) => {
            const position = getCardPosition(index);
            if (position === 'hidden') return null;

            return (
              <div
                key={index}
                className={`landing-discussion-card-3d ${position}`}
                onClick={() => handleOpenModal(video.youtubeId)}
              >
                <div className="landing-discussion-thumb">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--bg-card-solid)' }} />
                  )}
                  <div className="landing-discussion-play">
                    <Play size={20} fill="#0f172a" />
                  </div>
                </div>
                <div className="landing-discussion-info">
                  <h4 className="landing-discussion-name">{video.title}</h4>
                  <span className="landing-discussion-duration">{video.duration}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation */}
        {totalVideos > 1 && (
          <div className="landing-discussions-nav">
            <button
              className="landing-discussions-arrow"
              onClick={handlePrev}
              aria-label="Previous video"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="landing-discussions-dots">
              {videos.map((_, index) => (
                <button
                  key={index}
                  className={`landing-discussions-dot ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Video ${index + 1}`}
                />
              ))}
            </div>
            <button
              className="landing-discussions-arrow"
              onClick={handleNext}
              aria-label="Next video"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Video Modal */}
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