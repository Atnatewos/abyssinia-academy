/**
 * @fileoverview Course Catalog Card
 *
 * Replicates the exact visual structure of the landing page hero card.
 * Every catalog card is a self-contained "product page" tile:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ [BEST VALUE]                 [DURATION]  │
 *   │ 👑 Course Title                          │
 *   │ Complete curriculum, best value          │
 *   │ 1,199 ETB / per course                   │
 *   │ 2,499 ETB ⚡ 52% off                     │
 *   │ ✓ All structured phases                  │
 *   │ ✓ Lifetime access                        │
 *   │ ✓ Completion certificate                 │
 *   │ ✓ Private Telegram community             │
 *   │ [Enroll Now →]                           │
 *   └──────────────────────────────────────────┘
 *
 * Path: apps/web/components/pricing/CourseCard.jsx
 */

import Link from 'next/link';
import {
  ArrowRight, Crown, Check, Zap, Clock,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * @param {object} props
 * @param {object} props.course
 * @param {number} props.coursePrice         - Resolved price
 * @param {number|null} props.originalPrice  - Original price for discount display
 * @param {string} props.currency
 * @param {boolean} props.isFeatured
 * @param {string} props.viewDetailsLabel
 * @param {string} props.perCourseLabel
 * @param {string[]} props.features          - Feature bullets (i18n-resolved)
 */
const CourseCard = ({
  course,
  coursePrice,
  originalPrice = null,
  currency = 'ETB',
  isFeatured = false,
  viewDetailsLabel = 'Enroll Now',
  perCourseLabel = 'full course',
  features = [],
}) => {
  const { language } = useLanguage();

  const title =
    language === 'am' && course.title_am ? course.title_am : course.title;

  const description =
    language === 'am' && course.description_am
      ? course.description_am
      : course.description;

  // Discount percent (only when original > current and both valid)
  const discountPercent =
    originalPrice && originalPrice > coursePrice && coursePrice > 0
      ? Math.round(((originalPrice - coursePrice) / originalPrice) * 100)
      : 0;

  return (
    <Link
      href={`/pricing?course=${course.slug}`}
      className={`landing-pricing-equal-card ${isFeatured ? 'premium-card' : ''}`}
    >
      {/* Badge row — course.badge on left, duration on right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {course.badge ? (
          <span className="landing-pricing-equal-badge">
            <Crown size={12} />
            {course.badge}
          </span>
        ) : isFeatured ? (
          <span className="landing-pricing-equal-badge">
            <Crown size={12} />
            BEST VALUE
          </span>
        ) : (
          <span />
        )}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <Clock size={11} />
          {course.duration || '—'}
        </span>
      </div>

      {/* Title with crown icon (matches hero) */}
      <h3 className="landing-pricing-equal-title">
        <Crown
          size={16}
          style={{
            color: 'var(--accent-gold)',
            marginRight: '0.375rem',
            display: 'inline',
            verticalAlign: 'middle',
          }}
        />
        {title}
      </h3>

      {/* Subtitle — description preview */}
      <p className="landing-pricing-equal-subtitle">
        {description || 'Complete curriculum, best value'}
      </p>

      {/* Price row */}
      <div className="landing-pricing-equal-price-row">
        <span className="landing-pricing-equal-price">
          {coursePrice.toLocaleString()} {currency}
        </span>
        <span className="landing-pricing-equal-per-phase">
          / {perCourseLabel}
        </span>
      </div>

      {/* Discount line — original + % off (only when applicable) */}
      {discountPercent > 0 && (
        <div className="landing-pricing-equal-save-row">
          <span className="landing-pricing-equal-original">
            {originalPrice.toLocaleString()} {currency}
          </span>
          <span className="landing-pricing-equal-save">
            <Zap size={10} />
            {discountPercent}% off
          </span>
        </div>
      )}

      {/* Feature bullets */}
      {features.length > 0 && (
        <ul className="landing-pricing-equal-features">
          {features.map((feature, idx) => (
            <li key={idx}>
              <Check
                size={14}
                style={{
                  color: isFeatured
                    ? 'var(--accent-gold)'
                    : 'var(--text-muted)',
                }}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA — mirrors the hero card */}
      <div
        className={`landing-pricing-equal-cta ${isFeatured ? 'primary' : ''}`}
      >
        <span>{viewDetailsLabel}</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
};

export default CourseCard;