/**
 * @fileoverview Quick Actions Card Component
 * Quick links to portal, courses, community, and support
 * ALL links from config → getProfileConfig().quickActions
 * Path: apps/web/components/profile/QuickActionsCard.jsx
 */

import React from 'react';
import Link from 'next/link';
import { BookOpen, Grid, MessageCircle, HelpCircle, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getProfileConfig } from '../../lib/config';

const ICON_MAP = { BookOpen, Grid, MessageCircle, HelpCircle, Zap };

const QuickActionsCard = () => {
  const { t, language } = useLanguage();
  const profileConfig = getProfileConfig();
  const actions = profileConfig?.quickActions || [];

  if (actions.length === 0) return null;

  return (
    <div className="profile-card">
      <h3 className="profile-card-title">
        <Zap size={18} />
        {t.profile?.quickActions || 'Quick Actions'}
      </h3>

      <div className="profile-quick-actions">
        {actions.map((action) => {
          const IconComponent = ICON_MAP[action.icon] || Zap;
          const label = language === 'am' ? (action.labelAm || action.label) : action.label;

          if (action.external) {
            return (
              <a key={action.id} href={action.href} target="_blank" rel="noopener noreferrer" className="profile-quick-action-item">
                <span className="profile-quick-action-icon"><IconComponent size={18} /></span>
                <span className="profile-quick-action-label">{label}</span>
              </a>
            );
          }

          return (
            <Link key={action.id} href={action.href} className="profile-quick-action-item">
              <span className="profile-quick-action-icon"><IconComponent size={18} /></span>
              <span className="profile-quick-action-label">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsCard;