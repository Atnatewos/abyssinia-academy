/**
 * @fileoverview Resource Download Component
 * Lists downloadable code assets and resources for a lesson
 * Path: apps/web/components/portal/ResourceDownload.jsx
 */

import { FileCode, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ResourceDownload = ({ resources = [] }) => {
  const { t } = useLanguage();

  if (!resources || resources.length === 0) {
    return <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>No resources available.</p>;
  }

  return (
    <div className="resource-list">
      {resources.map((resource, index) => (
        <div key={index} className="resource-item">
          <span className="resource-name">
            <FileCode size={16} />
            {typeof resource === 'string' ? resource : resource.name}
          </span>
          <button className="resource-download-btn" onClick={() => { if (resource.url) window.open(resource.url, '_blank'); }}>
            <Download size={14} />
            <span>{t.portal?.download || 'Download'}</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ResourceDownload;