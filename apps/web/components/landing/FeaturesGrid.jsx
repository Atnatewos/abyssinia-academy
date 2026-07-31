/**
 * @fileoverview Features Grid Component
 * Displays the four key platform features in a responsive card grid
 * Path: apps/web/components/landing/FeaturesGrid.jsx
 */

import { Video, Code2, MessageSquare, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FeaturesGrid = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Video, title: 'Unlisted HD YouTube Sessions', description: 'Stream crisp HD pre-recorded live coding sessions anytime. Rewind, speed up, or rewatch complex topics at your own pace.' },
    { icon: Code2, title: 'Real Code Repositories', description: 'Access GitHub repositories for every single week, including boilerplate setups, solution branches, and assignment starters.' },
    { icon: MessageSquare, title: 'Private Mentorship Community', description: 'Connect directly with instructors and fellow engineering peers in our private Telegram technical discussion group.' },
    { icon: Award, title: 'Verified Skill Certification', description: 'Earn an official Abyssinia Academy Engineering Certificate upon successful completion and review of your 5-phase capstone project.' },
  ];

  return (
    <>
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag">Why Abyssinia Academy?</div>
        <h2 className="section-title">Designed for Practical Software Engineering</h2>
        <p className="section-subtitle">Everything you need to transform from zero coding knowledge into a job-ready full-stack engineer.</p>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="feature-card">
              <div className="feature-card-icon"><IconComponent /></div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FeaturesGrid;