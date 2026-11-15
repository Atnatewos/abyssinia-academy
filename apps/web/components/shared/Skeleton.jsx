/**
 * @fileoverview Skeleton Loading Primitives — Shape-Matched System
 *
 * Composable skeleton components built entirely with Tailwind utilities.
 * Every dimension, padding, and background color uses standard Tailwind
 * classes, meaning there is zero dependency on any external CSS file.
 *
 * A11y: every wrapper carries role="status" + aria-busy + i18n label.
 *
 * Path: apps/web/components/shared/Skeleton.jsx
 */
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Base primitive with shimmer animation and explicit rounded corners.
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
 * Generic card skeleton.
 */
const SkeletonCard = ({ showIcon = true, bodyLines = 3 }) => (
  <SkeletonWrapper className="p-6 rounded-2xl flex flex-col gap-5 bg-bg-card border border-border-light min-h-[220px] w-full">
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

/**
 * Shape-matched skeleton for the ScholarshipCard component.
 */
const SkeletonScholarshipCard = () => (
  <SkeletonWrapper className="flex flex-col rounded-2xl overflow-hidden border border-border-light bg-bg-card-solid h-full min-h-[400px]">
    <div className="relative h-40 bg-bg-skeleton animate-pulse shrink-0">
      <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-bg-card-solid border-4 border-bg-card-solid flex items-center justify-center z-10">
        <div className="w-8 h-8 rounded-lg bg-bg-skeleton animate-pulse" />
      </div>
    </div>
    <div className="pt-8 px-5 pb-5 flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-2">
        <div className="h-5 w-[80%] bg-bg-skeleton animate-pulse rounded-md" />
        <div className="h-3 w-full bg-bg-skeleton animate-pulse rounded-md" />
        <div className="h-3 w-[60%] bg-bg-skeleton animate-pulse rounded-md" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-24 rounded-full bg-bg-skeleton animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-bg-skeleton animate-pulse" />
      </div>
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-bg-skeleton animate-pulse rounded-md" />
          <div className="h-3 w-8 bg-bg-skeleton animate-pulse rounded-md" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-bg-skeleton animate-pulse" />
      </div>
      <div className="h-3 w-32 bg-bg-skeleton animate-pulse rounded-md mt-1" />
      <div className="mt-auto pt-4">
        <div className="h-10 w-full rounded-lg bg-bg-skeleton animate-pulse" />
      </div>
    </div>
  </SkeletonWrapper>
);

/**
 * Multi-column statistics grid.
 */
const SkeletonStatsGrid = ({ count = 4, showTrend = false }) => (
  <SkeletonWrapper className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="p-5 rounded-xl flex flex-col gap-3 bg-bg-card border border-border-light">
        <SkeletonBase className="h-3 w-[40%]" />
        <SkeletonBase className="h-6 w-[70%]" />
        {showTrend && <SkeletonBase className="h-2.5 w-[40%]" />}
      </div>
    ))}
  </SkeletonWrapper>
);

/**
 * Shape-matched table placeholder.
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
    <SkeletonWrapper className="w-full flex flex-col gap-3">
      {showHeader && (
        <div className="px-4 py-3 rounded-md bg-bg-skeleton/60" style={gridStyle}>
          {columns.length > 0
            ? columns.map((_, idx) => (
                <SkeletonBase key={`head-${idx}`} className="h-3 w-full animate-none bg-transparent" />
              ))
            : Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonBase key={`head-${idx}`} className="h-3 w-full animate-none bg-transparent" />
              ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 rounded-md" style={gridStyle}>
          {columns.length > 0
            ? columns.map((col, colIndex) => {
                if (col.type === 'avatar-text') {
                  return (
                    <div key={`cell-${rowIndex}-${colIndex}`} className="flex items-center gap-3">
                      <SkeletonBase className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex flex-col gap-2 flex-1">
                        <SkeletonBase className="h-3 w-[70%]" />
                        <SkeletonBase className="h-2.5 w-[40%]" />
                      </div>
                    </div>
                  );
                }
                if (col.type === 'badge' || col.type === 'pill') {
                  return (
                    <SkeletonBase
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`${col.type === 'pill' ? 'h-6 w-16 rounded-full' : 'h-5 w-12 rounded-md'}`}
                    />
                  );
                }
                return <SkeletonBase key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />;
              })
            : Array.from({ length: 4 }).map((_, colIndex) => (
                <SkeletonBase key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
              ))}
        </div>
      ))}
    </SkeletonWrapper>
  );
};

const SkeletonCircle = ({ size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return <SkeletonBase className={`rounded-full shrink-0 ${sizes[size] || sizes.md}`} />;
};

const SkeletonMedia = ({ ratio = 'default' }) => {
  const ratios = { default: 'aspect-video', square: 'aspect-square', portrait: 'aspect-[3/4]' };
  return <SkeletonBase className={`rounded-xl ${ratios[ratio] || ratios.default}`} />;
};

const SkeletonBonusCards = ({ count = 5 }) => (
  <SkeletonWrapper className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="p-5 rounded-xl flex flex-col gap-4 bg-bg-card border border-border-light">
        <div className="flex items-center gap-3">
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="h-4 flex-1" />
        </div>
        <SkeletonBase className="h-2 w-full rounded-full" />
        <div className="flex justify-between gap-2">
          <SkeletonBase className="h-3 w-[40%]" />
          <SkeletonBase className="h-3 w-[40%]" />
        </div>
      </div>
    ))}
  </SkeletonWrapper>
);

const SkeletonTree = ({ depths = [0, 1, 1, 2, 2, 1] }) => {
  const depthMap = { 0: 'ml-0', 1: 'ml-6', 2: 'ml-12', 3: 'ml-[4.5rem]' };
  return (
    <SkeletonWrapper className="flex flex-col gap-3">
      {depths.map((depth, index) => (
        <div key={index} className={`flex items-center gap-3 p-3 rounded-md ${depthMap[depth] || 'ml-0'}`}>
          <SkeletonBase className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <SkeletonBase className="h-3 w-1/2" />
            <SkeletonBase className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </SkeletonWrapper>
  );
};

export {
  SkeletonBase,
  SkeletonWrapper,
  SkeletonLines,
  SkeletonCard,
  SkeletonScholarshipCard,
  SkeletonStatsGrid,
  SkeletonTableRows,
  SkeletonCircle,
  SkeletonMedia,
  SkeletonBonusCards,
  SkeletonTree,
};

export default SkeletonBase;