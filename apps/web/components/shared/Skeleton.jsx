// /**
//  * @fileoverview Skeleton Loading Primitives — Shape-Matched System
//  *
//  * Composable skeleton components that mirror the exact layout of the
//  * content they replace. Every preset consumes a shape descriptor so the
//  * shimmer block matches the real element (table grid template, card
//  * structure, tree indentation, bonus-card layout) → zero CLS.
//  *
//  * All dimensions and colors resolve through CSS custom properties from
//  * themes.css. Shimmer on desktop, simple pulse under reduced-motion.
//  *
//  * A11y: every wrapper carries role="status" + aria-busy + i18n label.
//  *
//  * Path: apps/web/components/shared/Skeleton.jsx
//  */
// import React from 'react';
// import { useLanguage } from '../../context/LanguageContext';

// /**
//  * Base primitive with shimmer animation.
//  * @param {object} props - Component props
//  * @param {string} props.className - Additional CSS classes
//  * @param {React.CSSProperties} props.style - Inline styles
//  */
// const SkeletonBase = ({ className = '', style = {} }) => (
//   <div className={`skeleton-base ${className}`} style={style} aria-hidden="true" />
// );

// /**
//  * A11y-friendly wrapper applied to every skeleton group.
//  * Reads the localized "Loading content..." label from i18n.
//  *
//  * @param {object} props - Component props
//  * @param {string} props.className - Additional CSS classes
//  * @param {React.ReactNode} props.children - Skeleton content
//  */
// const SkeletonWrapper = ({ className = '', children }) => {
//   const { t } = useLanguage();
//   return (
//     <div
//       role="status"
//       aria-busy="true"
//       aria-label={t.common?.loadingContent || 'Loading content'}
//       className={`skeleton-wrapper ${className}`}
//     >
//       {children}
//     </div>
//   );
// };

// /**
//  * Text block placeholder with configurable widths per line.
//  *
//  * @param {object} props - Component props
//  * @param {number} props.lines - Number of lines (default: 3)
//  * @param {Array<'full'|'medium'|'short'>} props.widths - Per-line widths
//  */
// const SkeletonLines = ({ lines = 3, widths = [] }) => {
//   const widthMap = { full: 'skeleton-line-full', medium: 'skeleton-line-medium', short: 'skeleton-line-short' };
//   return (
//     <div className="skeleton-lines" aria-hidden="true">
//       {Array.from({ length: lines }).map((_, index) => {
//         const width = widths[index] || widths[widths.length - 1] || 'full';
//         return <SkeletonBase key={index} className={`skeleton-line ${widthMap[width] || widthMap.full}`} />;
//       })}
//     </div>
//   );
// };

// /**
//  * Generic card skeleton: optional icon, title line, body lines.
//  *
//  * @param {object} props - Component props
//  * @param {boolean} props.showIcon - Render icon placeholder
//  * @param {number} props.bodyLines - Number of body text lines
//  */
// const SkeletonCard = ({ showIcon = true, bodyLines = 3 }) => (
//   <SkeletonWrapper className="skeleton-card skeleton-base">
//     {showIcon && (
//       <div className="skeleton-card-header">
//         <SkeletonBase className="skeleton-card-icon" />
//         <SkeletonBase className="skeleton-card-title" />
//       </div>
//     )}
//     <div className="skeleton-card-body">
//       <SkeletonLines lines={bodyLines} />
//     </div>
//   </SkeletonWrapper>
// );

// /**
//  * Multi-column statistics grid. Count is typically driven by config
//  * (e.g., dashboard stat cards) — never hardcode in call sites.
//  *
//  * @param {object} props - Component props
//  * @param {number} props.count - Number of stat cards
//  * @param {boolean} props.showTrend - Render optional trend line
//  */
// const SkeletonStatsGrid = ({ count = 4, showTrend = false }) => (
//   <SkeletonWrapper className="skeleton-stats-grid">
//     {Array.from({ length: count }).map((_, index) => (
//       <div key={index} className="skeleton-stat-card skeleton-base">
//         <SkeletonBase className="skeleton-stat-label skeleton-line-short" />
//         <SkeletonBase className="skeleton-stat-value skeleton-line-medium" />
//         {showTrend && <SkeletonBase className="skeleton-stat-trend skeleton-line-short" />}
//       </div>
//     ))}
//   </SkeletonWrapper>
// );

// /**
//  * Shape-matched table placeholder. The `columns` array drives the grid
//  * template so the shimmer columns align with the real table's columns.
//  *
//  * @param {object} props - Component props
//  * @param {Array<{width: string, type: 'text'|'badge'|'pill'|'avatar-text'}>} props.columns
//  * @param {number} props.rows - Number of data rows (ideally from config)
//  * @param {boolean} props.showHeader - Render header row
//  */
// const SkeletonTableRows = ({ columns = [], rows = 5, showHeader = true }) => {
//   const gridTemplate = columns.length > 0
//     ? columns.map((col) => col.width || '1fr').join(' ')
//     : '2fr 1fr 1fr 1fr';

//   const gridStyle = {
//     display: 'grid',
//     gridTemplateColumns: gridTemplate,
//     gap: '1rem',
//     alignItems: 'center',
//   };

//   return (
//     <SkeletonWrapper className="skeleton-table">
//       {showHeader && (
//         <div className="skeleton-table-header" style={gridStyle}>
//           {columns.length > 0
//             ? columns.map((col, idx) => (
//                 <SkeletonBase key={`head-${idx}`} className="skeleton-table-cell skeleton-line-full" />
//               ))
//             : Array.from({ length: 4 }).map((_, idx) => (
//                 <SkeletonBase key={`head-${idx}`} className="skeleton-table-cell skeleton-line-full" />
//               ))}
//         </div>
//       )}
//       {Array.from({ length: rows }).map((_, rowIndex) => (
//         <div key={rowIndex} className="skeleton-table-row" style={gridStyle}>
//           {columns.length > 0
//             ? columns.map((col, colIndex) => {
//                 if (col.type === 'avatar-text') {
//                   return (
//                     <div key={`cell-${rowIndex}-${colIndex}`} className="skeleton-avatar-text">
//                       <SkeletonBase className="skeleton-circle skeleton-circle-sm" />
//                       <div className="skeleton-avatar-text-lines">
//                         <SkeletonBase className="skeleton-line skeleton-line-medium" />
//                         <SkeletonBase className="skeleton-line skeleton-line-short" />
//                       </div>
//                     </div>
//                   );
//                 }
//                 if (col.type === 'badge' || col.type === 'pill') {
//                   return (
//                     <SkeletonBase
//                       key={`cell-${rowIndex}-${colIndex}`}
//                       className={`skeleton-table-cell ${col.type === 'pill' ? 'skeleton-pill' : 'skeleton-badge'}`}
//                     />
//                   );
//                 }
//                 return (
//                   <SkeletonBase
//                     key={`cell-${rowIndex}-${colIndex}`}
//                     className="skeleton-table-cell skeleton-line-full"
//                   />
//                 );
//               })
//             : Array.from({ length: 4 }).map((_, colIndex) => (
//                 <SkeletonBase
//                   key={`cell-${rowIndex}-${colIndex}`}
//                   className="skeleton-table-cell skeleton-line-full"
//                 />
//               ))}
//         </div>
//       ))}
//     </SkeletonWrapper>
//   );
// };

// /**
//  * Circular avatar placeholder in three sizes.
//  *
//  * @param {object} props - Component props
//  * @param {'sm'|'md'|'lg'} props.size - Circle size
//  */
// const SkeletonCircle = ({ size = 'md' }) => (
//   <SkeletonBase className={`skeleton-circle skeleton-circle-${size}`} />
// );

// /**
//  * Media thumbnail placeholder with aspect ratio.
//  *
//  * @param {object} props - Component props
//  * @param {'default'|'square'|'portrait'} props.ratio - Aspect ratio
//  */
// const SkeletonMedia = ({ ratio = 'default' }) => (
//   <SkeletonBase
//     className={`skeleton-media ${ratio !== 'default' ? `skeleton-media-${ratio}` : ''}`}
//   />
// );

// /**
//  * Bonus category card: icon circle + title + progress bar + footer.
//  * Matches the shape of MLMBonusTracker category cards exactly.
//  *
//  * @param {object} props - Component props
//  * @param {number} props.count - Number of bonus cards (ideally from config)
//  */
// const SkeletonBonusCards = ({ count = 5 }) => (
//   <SkeletonWrapper className="skeleton-bonus-grid">
//     {Array.from({ length: count }).map((_, index) => (
//       <div key={index} className="skeleton-bonus-card skeleton-base">
//         <div className="skeleton-bonus-card-header">
//           <SkeletonBase className="skeleton-circle skeleton-circle-md" />
//           <SkeletonBase className="skeleton-bonus-title skeleton-line-medium" />
//         </div>
//         <SkeletonBase className="skeleton-progress-bar" />
//         <div className="skeleton-bonus-footer">
//           <SkeletonBase className="skeleton-line skeleton-line-short" />
//           <SkeletonBase className="skeleton-line skeleton-line-short" />
//         </div>
//       </div>
//     ))}
//   </SkeletonWrapper>
// );

// /**
//  * Nested tree structure placeholder with indent levels.
//  * Matches MLMTreeView node shape: avatar + name + meta per node.
//  *
//  * @param {object} props - Component props
//  * @param {Array<number>} props.depths - Array of depth values (0, 1, 2)
//  */
// const SkeletonTree = ({ depths = [0, 1, 1, 2, 2, 1] }) => (
//   <SkeletonWrapper className="skeleton-tree">
//     {depths.map((depth, index) => {
//       const depthClass = depth > 0 ? `skeleton-tree-node-depth-${Math.min(depth, 3)}` : '';
//       return (
//         <div key={index} className={`skeleton-tree-node ${depthClass}`}>
//           <SkeletonBase className="skeleton-tree-avatar" />
//           <div className="skeleton-tree-content">
//             <SkeletonBase className="skeleton-tree-name" />
//             <SkeletonBase className="skeleton-tree-meta" />
//           </div>
//         </div>
//       );
//     })}
//   </SkeletonWrapper>
// );

// export {
//   SkeletonBase,
//   SkeletonWrapper,
//   SkeletonLines,
//   SkeletonCard,
//   SkeletonStatsGrid,
//   SkeletonTableRows,
//   SkeletonCircle,
//   SkeletonMedia,
//   SkeletonBonusCards,
//   SkeletonTree,
// };

// export default SkeletonBase;




/**
 * @fileoverview Skeleton Loading Primitives — Shape-Matched System
 *
 * Composable skeleton components built entirely with Tailwind utilities.
 * Every dimension, padding, and background color uses standard Tailwind
 * classes, meaning there is zero dependency on an external skeleton.css.
 *
 * A11y: every wrapper carries role="status" + aria-busy + i18n label.
 *
 * Path: apps/web/components/shared/Skeleton.jsx
 */
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Base primitive with shimmer animation.
 */
const SkeletonBase = ({ className = '', style = {} }) => (
  <div
    className={`animate-pulse bg-bg-skeleton rounded-md ${className}`}
    style={style}
    aria-hidden="true"
  />
);

/**
 * A11y-friendly wrapper applied to every skeleton group.
 */
const SkeletonWrapper = ({ className = '', children }) => {
  const { t } = useLanguage();
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t.common?.loadingContent || 'Loading content'}
      className={className}
    >
      {children}
    </div>
  );
};

/**
 * Text block placeholder with configurable widths per line.
 */
const SkeletonLines = ({ lines = 3, widths = [] }) => {
  const widthMap = {
    full: 'w-full',
    medium: 'w-[70%]',
    short: 'w-[40%]',
  };
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        const width = widths[index] || widths[widths.length - 1] || 'full';
        return <SkeletonBase key={index} className={`h-3.5 ${widthMap[width] || 'w-full'}`} />;
      })}
    </div>
  );
};

/**
 * Shape-matched skeleton for the ScholarshipCard component.
 * Matches the cover image, floating icon, badges, quota bar, and CTA.
 */
const SkeletonScholarshipCard = () => (
  <SkeletonWrapper className="flex flex-col rounded-2xl overflow-hidden border border-border-light bg-bg-card-solid h-full min-h-[400px]">
    {/* Cover Image Area */}
    <div className="relative h-40 bg-bg-skeleton animate-pulse shrink-0">
      {/* Floating Icon Placeholder */}
      <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-bg-card-solid border-4 border-bg-card-solid flex items-center justify-center z-10">
        <div className="w-8 h-8 rounded-lg bg-bg-skeleton animate-pulse" />
      </div>
    </div>

    {/* Content Area */}
    <div className="pt-8 px-5 pb-5 flex flex-col gap-4 flex-1">
      {/* Title & Description */}
      <div className="flex flex-col gap-2">
        <div className="h-5 w-[80%] bg-bg-skeleton animate-pulse rounded-md" />
        <div className="h-3 w-full bg-bg-skeleton animate-pulse rounded-md" />
        <div className="h-3 w-[60%] bg-bg-skeleton animate-pulse rounded-md" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-24 rounded-full bg-bg-skeleton animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-bg-skeleton animate-pulse" />
      </div>

      {/* Quota Bar */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-bg-skeleton animate-pulse rounded-md" />
          <div className="h-3 w-8 bg-bg-skeleton animate-pulse rounded-md" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-bg-skeleton animate-pulse" />
      </div>

      {/* Deadline Row */}
      <div className="h-3 w-32 bg-bg-skeleton animate-pulse rounded-md mt-1" />

      {/* CTA Button (Pushed to bottom) */}
      <div className="mt-auto pt-4">
        <div className="h-10 w-full rounded-lg bg-bg-skeleton animate-pulse" />
      </div>
    </div>
  </SkeletonWrapper>
);

/**
 * Generic card skeleton.
 */
const SkeletonCard = ({ showIcon = true, bodyLines = 3 }) => (
  <SkeletonWrapper className="p-6 rounded-2xl flex flex-col gap-5 bg-bg-card border border-border-light min-h-[220px]">
    {showIcon && (
      <div className="flex items-center gap-4">
        <SkeletonBase className="w-12 h-12 rounded-full shrink-0" />
        <SkeletonBase className="h-5 flex-1" />
      </div>
    )}
    <div className="flex flex-col gap-3 mt-2">
      <SkeletonLines lines={bodyLines} />
    </div>
  </SkeletonWrapper>
);

export {
  SkeletonBase,
  SkeletonWrapper,
  SkeletonLines,
  SkeletonCard,
  SkeletonScholarshipCard,
};

export default SkeletonBase;