/**
 * @fileoverview Scholarship Card
 *
 * Compact card representing a single scholarship campaign in the browse
 * grid. Renders:
 *   - Cover image (or gradient placeholder)
 *   - Campaign name + short description
 *   - Grant badge (full course vs phases)
 *   - Fee badge (free vs paid)
 *   - Quota progress (spots remaining / total)
 *   - Application status badge (if user has applied)
 *   - CTA (View Details / Apply Now / Applied / Closed / Full)
 *
 * All text via i18n. All colors via design tokens. No hardcoded strings.
 *
 * Path: apps/web/components/scholarships/ScholarshipCard.jsx
 */

import React from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle,
  Clock,
  Gift,
  Users,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Derive a status badge descriptor from the campaign + user's application.
 *
 * @param {object} campaign
 * @param {object|null} myApplication
 * @param {Date} now
 * @returns {{ key: string, labelKey: string, tone: 'primary'|'success'|'warning'|'error'|'neutral' }}
 */
const getStatusBadge = (campaign, myApplication, now) => {
  if (myApplication) {
    return { key: 'applied', labelKey: 'scholarships.card.applied', tone: 'success' };
  }

  const closeAt = campaign.applicationsCloseAt
    ? new Date(campaign.applicationsCloseAt)
    : null;

  if (closeAt && closeAt < now) {
    return { key: 'closed', labelKey: 'scholarships.card.closed', tone: 'neutral' };
  }
  if (campaign.remaining <= 0) {
    return { key: 'full', labelKey: 'scholarships.card.full', tone: 'error' };
  }
  return { key: 'open', labelKey: 'scholarships.card.applyNow', tone: 'primary' };
};

/**
 * Tone-to-class mapping. Uses design tokens only — no raw palette.
 */
const TONE_CLASSES = {
  primary: 'bg-accent/10 text-accent border-accent/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  error: 'bg-error/10 text-error border-error/30',
  neutral: 'bg-bg-pill text-text-muted border-border-medium',
};

/**
 * ScholarshipCard — clickable card linking to the campaign detail page.
 *
 * @param {object} props
 * @param {object} props.campaign - Campaign from /api/scholarships
 * @param {object|null} [props.myApplication] - User's existing application (if any)
 * @param {string} [props.className] - Additional classes
 */
const ScholarshipCard = ({ campaign, myApplication = null, className = '' }) => {
  const { t, language } = useLanguage();
  const now = new Date();

  const name = language === 'am' && campaign.nameAm
    ? campaign.nameAm
    : campaign.name;
  const description = language === 'am' && campaign.descriptionAm
    ? campaign.descriptionAm
    : campaign.description;

  const status = getStatusBadge(campaign, myApplication, now);
  const statusTone = TONE_CLASSES[status.tone] || TONE_CLASSES.neutral;

  /* Grant descriptor — full course vs specific phases */
  const grantText = campaign.grantsFullCourse
    ? t.scholarships?.card?.fullCourse || 'Full Course Access'
    : (t.scholarships?.card?.phases || '{count} Phase(s)').replace(
        '{count}',
        String((campaign.grantsPhases || []).length)
      );

  /* Fee descriptor — free vs paid */
  const feeText =
    Number(campaign.registrationFeeETB) > 0
      ? (t.scholarships?.card?.registrationFee || '{amount} ETB Registration').replace(
          '{amount}',
          Number(campaign.registrationFeeETB).toLocaleString()
        )
      : t.scholarships?.card?.registrationFree || 'Free Registration';

  /* Quota progress — hide when remaining is null (privacy off) */
  const hasQuota = campaign.remaining !== null && campaign.remaining !== undefined;
  const quotaPercent =
    hasQuota && campaign.quota > 0
      ? Math.min(100, Math.round(((campaign.quota - campaign.remaining) / campaign.quota) * 100))
      : 0;

  /* CTA target — always the detail page. The detail page decides
     whether to show apply form or status block. */
  const href = `/scholarships/${encodeURIComponent(campaign.slug)}`;

  const renderStatusBadge = () => {
    if (status.key === 'applied') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-2xs font-bold ${statusTone}`}
        >
          <CheckCircle size={11} />
          {t.scholarships?.card?.applied || 'Applied'}
        </span>
      );
    }
    if (status.key === 'closed') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-2xs font-bold ${statusTone}`}
        >
          <Clock size={11} />
          {t.scholarships?.card?.closed || 'Applications Closed'}
        </span>
      );
    }
    if (status.key === 'full') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-2xs font-bold ${statusTone}`}
        >
          <Lock size={11} />
          {t.scholarships?.card?.full || 'Quota Full'}
        </span>
      );
    }
    return null;
  };

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ease-out
                  bg-bg-card-solid border border-border-light hover:border-accent/40
                  hover:-translate-y-1 hover:shadow-glow-gold ${className}`}
    >
      {/* ── Cover (image or gradient placeholder) ── */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-accent/20 via-accent/10 to-transparent overflow-hidden">
        {campaign.coverImageUrl ? (
          <img
            src={campaign.coverImageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Award size={48} className="text-accent/40" />
          </div>
        )}

        {/* Status badge overlay (top-right) */}
        {status.key !== 'open' && (
          <div className="absolute top-3 right-3">{renderStatusBadge()}</div>
        )}

        {/* Fee ribbon (top-left) */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-main/90 backdrop-blur-sm border border-accent/30 text-accent text-2xs font-bold">
            <Gift size={11} />
            {feeText}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3 className="text-lg font-extrabold text-text-main group-hover:text-accent transition-colors line-clamp-2">
          {name}
        </h3>

        {description && (
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Grant badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 text-accent text-2xs font-bold border border-accent/20">
            <Award size={11} />
            {grantText}
          </span>
        </div>

        {/* Quota progress */}
        {hasQuota && campaign.quota > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-text-muted inline-flex items-center gap-1">
                <Users size={11} />
                {(t.scholarships?.card?.spotsRemaining || '{remaining} of {total} spots left')
                  .replace('{remaining}', String(campaign.remaining))
                  .replace('{total}', String(campaign.quota))}
              </span>
              <span className="text-2xs font-bold text-text-dim">{quotaPercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-border-light overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border-light">
          <span className="text-xs font-bold text-accent group-hover:underline">
            {t.scholarships?.card?.viewDetails || 'View Details'} →
          </span>
          {status.key === 'open' && (
            <span className="text-2xs text-text-dim">
              {t.scholarships?.card?.applyNow || 'Apply Now'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ScholarshipCard;