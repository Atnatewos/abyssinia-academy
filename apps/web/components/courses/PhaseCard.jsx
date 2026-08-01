/**
 * @fileoverview Phase Card Component - Plain strings only
 * Path: apps/web/components/courses/PhaseCard.jsx
 */

import Link from 'next/link';
import { ChevronRight, Check, Code2, Terminal, Layers, Zap, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const iconMap = { Code2, Terminal, Layers, Zap, Trophy };

const PhaseCard = ({ phase, index = 0 }) => {
  const { t } = useLanguage();
  const IconComponent = iconMap[phase.icon] || Code2;

  return (
    <div className="phase-card" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="phase-card-bar" style={{ background: `linear-gradient(90deg, var(--gold-500), var(--gold-400))` }} />
      <div>
        <div className="phase-card-header">
          <span className="phase-card-number">Phase {phase.number}</span>
          <span className="phase-card-duration">{phase.duration}</span>
        </div>
        <div className="phase-card-icon"><IconComponent /></div>
        <h3 className="phase-card-title">{phase.title}</h3>
        <p className="phase-card-subtitle">{phase.subtitle}</p>
        <p className="phase-card-desc">{phase.description}</p>
        {phase.outcomes && phase.outcomes.length > 0 && (
          <div className="phase-card-outcomes">
            <span className="phase-card-outcomes-label">{t.courses?.phaseOutcomes || 'Key Learning Focus'}</span>
            <ul className="phase-card-outcomes-list">
              {phase.outcomes.map((outcome, idx) => (
                <li key={idx} className="phase-card-outcome">
                  <Check /><span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="phase-card-bottom">
        <span className="phase-card-module">Phase {phase.number} Module</span>
        <Link href="/portal" className="phase-card-btn">
          <span>{t.courses?.watchClass || 'Open Classroom'}</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default PhaseCard;