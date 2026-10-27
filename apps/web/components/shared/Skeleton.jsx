/**
 * @fileoverview Skeleton Loading Primitives — Shape-Matched System
 *
 * Composable skeleton components that mirror the exact layout of the
 * content they replace. Every preset consumes a shape descriptor so the
 * shimmer block matches the real element (table grid template, card
 * structure, tree indentation, bonus-card layout) → zero CLS.
 *
 * All dimensions and colors resolve through CSS custom properties from
 * themes.css. Shimmer on desktop, simple pulse under reduced-motion.
 *
 * A11y: every wrapper carries role="status" + aria-busy + i18n label.
 *
 * Path: apps/web/components/shared/Skeleton.jsx
 */
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Base primitive with shimmer animation.
 * @param {object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 */
const SkeletonBase = ({ className = '', style = {} }) => (
  <div className={`skeleton-base ${className}`} style={style} aria-hidden="true" />
);

/**
 * A11y-friendly wrapper applied to every skeleton group.
 * Reads the localized "Loading content..." label from i18n.
 *
 * @param {object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Skeleton content
 */
const SkeletonWrapper = ({ className = '', children }) => {
  const { t } = useLanguage();
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t.common?.loadingContent || 'Loading content'}
      className={`skeleton-wrapper ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Text block placeholder with configurable widths per line.
 *
 * @param {object} props - Component props
 * @param {number} props.lines - Number of lines (default: 3)
 * @param {Array<'full'|'medium'|'short'>} props.widths - Per-line widths
 */
const SkeletonLines = ({ lines = 3, widths = [] }) => {
  const widthMap = { full: 'skeleton-line-full', medium: 'skeleton-line-medium', short: 'skeleton-line-short' };
  return (
    <div className="skeleton-lines" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        const width = widths[index] || widths[widths.length - 1] || 'full';
        return <SkeletonBase key={index} className={`skeleton-line ${widthMap[width] || widthMap.full}`} />;
      })}
    </div>
  );
};

/**
 * Generic card skeleton: optional icon, title line, body lines.
 *
 * @param {object} props - Component props
 * @param {boolean} props.showIcon - Render icon placeholder
 * @param {number} props.bodyLines - Number of body text lines
 */
const SkeletonCard = ({ showIcon = true, bodyLines = 3 }) => (
  <SkeletonWrapper className="skeleton-card skeleton-base">
    {showIcon && (
      <div className="skeleton-card-header">
        <SkeletonBase className="skeleton-card-icon" />
        <SkeletonBase className="skeleton-card-title" />
      </div>
    )}
    <div className="skeleton-card-body">
      <SkeletonLines lines={bodyLines} />
    </div>
  </SkeletonWrapper>
);

/**
 * Multi-column statistics grid. Count is typically driven by config
 * (e.g., dashboard stat cards) — never hardcode in call sites.
 *
 * @param {object} props - Component props
 * @param {number} props.count - Number of stat cards
 * @param {boolean} props.showTrend - Render optional trend line
 */
const SkeletonStatsGrid = ({ count = 4, showTrend = false }) => (
  <SkeletonWrapper className="skeleton-stats-grid">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton-stat-card skeleton-base">
        <SkeletonBase className="skeleton-stat-label skeleton-line-short" />
        <SkeletonBase className="skeleton-stat-value skeleton-line-medium" />
        {showTrend && <SkeletonBase className="skeleton-stat-trend skeleton-line-short" />}
      </div>
    ))}
  </SkeletonWrapper>
);

/**
 * Shape-matched table placeholder. The `columns` array drives the grid
 * template so the shimmer columns align with the real table's columns.
 *
 * @param {object} props - Component props
 * @param {Array<{width: string, type: 'text'|'badge'|'pill'|'avatar-text'}>} props.columns
 * @param {number} props.rows - Number of data rows (ideally from config)
 * @param {boolean} props.showHeader - Render header row
 */
const SkeletonTableRows = ({ columns = [], rows = 5, showHeader = true }) => {
  const gridTemplate = columns.length > 0
    ? columns.map((col) => col.width || '1fr').join(' ')
    : '2fr 1fr 1fr 1fr';

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: gridTemplate,
    gap: '1rem',
    alignItems: 'center',
  };

  return (
    <SkeletonWrapper className="skeleton-table">
      {showHeader && (
        <div className="skeleton-table-header" style={gridStyle}>
          {columns.length > 0
            ? columns.map((col, idx) => (
                <SkeletonBase key={`head-${idx}`} className="skeleton-table-cell skeleton-line-full" />
              ))
            : Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonBase key={`head-${idx}`} className="skeleton-table-cell skeleton-line-full" />
              ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row" style={gridStyle}>
          {columns.length > 0
            ? columns.map((col, colIndex) => {
                if (col.type === 'avatar-text') {
                  return (
                    <div key={`cell-${rowIndex}-${colIndex}`} className="skeleton-avatar-text">
                      <SkeletonBase className="skeleton-circle skeleton-circle-sm" />
                      <div className="skeleton-avatar-text-lines">
                        <SkeletonBase className="skeleton-line skeleton-line-medium" />
                        <SkeletonBase className="skeleton-line skeleton-line-short" />
                      </div>
                    </div>
                  );
                }
                if (col.type === 'badge' || col.type === 'pill') {
                  return (
                    <SkeletonBase
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`skeleton-table-cell ${col.type === 'pill' ? 'skeleton-pill' : 'skeleton-badge'}`}
                    />
                  );
                }
                return (
                  <SkeletonBase
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="skeleton-table-cell skeleton-line-full"
                  />
                );
              })
            : Array.from({ length: 4 }).map((_, colIndex) => (
                <SkeletonBase
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="skeleton-table-cell skeleton-line-full"
                />
              ))}
        </div>
      ))}
    </SkeletonWrapper>
  );
};

/**
 * Circular avatar placeholder in three sizes.
 *
 * @param {object} props - Component props
 * @param {'sm'|'md'|'lg'} props.size - Circle size
 */
const SkeletonCircle = ({ size = 'md' }) => (
  <SkeletonBase className={`skeleton-circle skeleton-circle-${size}`} />
);

/**
 * Media thumbnail placeholder with aspect ratio.
 *
 * @param {object} props - Component props
 * @param {'default'|'square'|'portrait'} props.ratio - Aspect ratio
 */
const SkeletonMedia = ({ ratio = 'default' }) => (
  <SkeletonBase
    className={`skeleton-media ${ratio !== 'default' ? `skeleton-media-${ratio}` : ''}`}
  />
);

/**
 * Bonus category card: icon circle + title + progress bar + footer.
 * Matches the shape of MLMBonusTracker category cards exactly.
 *
 * @param {object} props - Component props
 * @param {number} props.count - Number of bonus cards (ideally from config)
 */
const SkeletonBonusCards = ({ count = 5 }) => (
  <SkeletonWrapper className="skeleton-bonus-grid">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton-bonus-card skeleton-base">
        <div className="skeleton-bonus-card-header">
          <SkeletonBase className="skeleton-circle skeleton-circle-md" />
          <SkeletonBase className="skeleton-bonus-title skeleton-line-medium" />
        </div>
        <SkeletonBase className="skeleton-progress-bar" />
        <div className="skeleton-bonus-footer">
          <SkeletonBase className="skeleton-line skeleton-line-short" />
          <SkeletonBase className="skeleton-line skeleton-line-short" />
        </div>
      </div>
    ))}
  </SkeletonWrapper>
);

/**
 * Nested tree structure placeholder with indent levels.
 * Matches MLMTreeView node shape: avatar + name + meta per node.
 *
 * @param {object} props - Component props
 * @param {Array<number>} props.depths - Array of depth values (0, 1, 2)
 */
const SkeletonTree = ({ depths = [0, 1, 1, 2, 2, 1] }) => (
  <SkeletonWrapper className="skeleton-tree">
    {depths.map((depth, index) => {
      const depthClass = depth > 0 ? `skeleton-tree-node-depth-${Math.min(depth, 3)}` : '';
      return (
        <div key={index} className={`skeleton-tree-node ${depthClass}`}>
          <SkeletonBase className="skeleton-tree-avatar" />
          <div className="skeleton-tree-content">
            <SkeletonBase className="skeleton-tree-name" />
            <SkeletonBase className="skeleton-tree-meta" />
          </div>
        </div>
      );
    })}
  </SkeletonWrapper>
);

export {
  SkeletonBase,
  SkeletonWrapper,
  SkeletonLines,
  SkeletonCard,
  SkeletonStatsGrid,
  SkeletonTableRows,
  SkeletonCircle,
  SkeletonMedia,
  SkeletonBonusCards,
  SkeletonTree,
};

export default SkeletonBase;