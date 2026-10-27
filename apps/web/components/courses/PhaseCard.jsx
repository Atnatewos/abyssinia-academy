/**
 * @fileoverview Phase Card Component
 * Displays a single phase overview card with outcomes and classroom link.
 * Links directly to /portal?phase=X for direct navigation to that phase.
 * Path: apps/web/components/courses/PhaseCard.jsx
 */

import Link from 'next/link';
import { ChevronRight, Check, Code2, Terminal, Layers, Zap, Trophy, Cpu, Database, Server, ShieldCheck, Rocket } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const iconMap = { Code2, Terminal, Layers, Zap, Trophy, Cpu, Database, Server, ShieldCheck, Rocket };

const PhaseCard = ({ phase, index = 0 }) => {
  const { language, t } = useLanguage();
  const IconComponent = iconMap[phase.icon] || Code2;
  const title = language === 'am' && phase.title_am ? phase.title_am : phase.title;
  const subtitle = language === 'am' && phase.subtitle_am ? phase.subtitle_am : phase.subtitle;
  const description = language === 'am' && phase.description_am ? phase.description_am : phase.description;
  const phaseNumber = phase.phase_number || phase.number;

  return (
    <div className="phase-card" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="phase-card-bar" style={{ background: `linear-gradient(90deg, var(--gold-500), var(--gold-400))` }} />
      <div>
        <div className="phase-card-header">
          <span className="phase-card-number">Phase {phaseNumber}</span>
          <span className="phase-card-duration">{phase.duration}</span>
        </div>
        <div className="phase-card-icon"><IconComponent /></div>
        <h3 className="phase-card-title">{title}</h3>
        <p className="phase-card-subtitle">{subtitle}</p>
        <p className="phase-card-desc">{description}</p>
        {phase.outcomes && phase.outcomes.length > 0 && (
          <div className="phase-card-outcomes">
            <span className="phase-card-outcomes-label">{t.courses?.phaseOutcomes || 'Key Learning Focus'}</span>
            <ul className="phase-card-outcomes-list">
              {phase.outcomes.map((outcome, idx) => (
                <li key={idx} className="phase-card-outcome"><Check /><span>{typeof outcome === 'string' ? outcome : outcome.text}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="phase-card-bottom">
        <span className="phase-card-module">Phase {phaseNumber} Module</span>
        <Link href={`/portal?phase=${phaseNumber}`} className="phase-card-btn">
          <span>{t.courses?.watchClass || 'Open Classroom'}</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default PhaseCard;