/**
 * @fileoverview MLM Tree View
 *
 * Renders the user's downline as an expandable hierarchy. Node contract:
 *   { userId, fullName, phone, joinedAt, depth, earningsFromUser, children }
 *
 * Levels 1-2 render expanded by default; deeper levels collapse to keep
 * initial paint light on slow connections.
 *
 * Path: apps/web/components/referral/MLMTreeView.jsx
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, User, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LEVEL_LABELS = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4' };
const LEVEL_COLORS = {
  1: 'var(--color-accent)',
  2: 'var(--color-info, #3b82f6)',
  3: 'var(--color-purple, #8b5cf6)',
  4: 'var(--color-muted, #6b7280)',
};

/**
 * Formats an ISO date to a short readable string.
 * @param {string} isoDate
 * @returns {string}
 */
const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

/**
 * Recursive tree node component.
 */
const TreeNode = ({ node, depth }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const levelColor = LEVEL_COLORS[depth] || LEVEL_COLORS[4];

  return (
    <div className="mlm-tree-node" style={{ paddingLeft: depth > 1 ? '20px' : '0' }}>
      <div className="mlm-tree-node-row">
        <button
          type="button"
          className={`mlm-tree-toggle ${hasChildren ? '' : 'invisible'}`}
          onClick={() => setExpanded(!expanded)}
          disabled={!hasChildren}
          aria-label={hasChildren ? (expanded ? 'Collapse' : 'Expand') : 'No children'}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="mlm-tree-avatar" style={{ backgroundColor: `${levelColor}20`, color: levelColor }}>
          {hasChildren ? <Users size={16} /> : <User size={16} />}
        </div>

        <div className="mlm-tree-info">
          <span className="mlm-tree-name">{node.fullName || '—'}</span>
          <span className="mlm-tree-meta">{formatDate(node.joinedAt)}</span>
        </div>

        <span className="mlm-tree-level" style={{ color: levelColor, backgroundColor: `${levelColor}15` }}>
          {LEVEL_LABELS[depth] || `L${depth}`}
        </span>

        {node.earningsFromUser > 0 && (
          <span className="mlm-tree-earnings">
            {Number(node.earningsFromUser).toLocaleString('en-US')} ETB
          </span>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="mlm-tree-children">
          {node.children.map((child) => (
            <TreeNode key={child.userId} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const MLMTreeView = ({ tree, totalDescendants, loading }) => {
  const { t } = useLanguage();

  return (
    <div className="glass-card mlm-tree-view">
      <div className="mlm-tree-header">
        <h3 className="mlm-section-title">
          {t.referrals?.mlm?.tree?.title || 'Your Downline Tree'}
        </h3>
        <span className="mlm-tree-count">
          <Users size={16} />
          {totalDescendants} {t.referrals?.mlm?.tree?.members || 'members'}
        </span>
      </div>

      {loading ? (
        <div className="mlm-tree-loading">
          <div className="spinner spinner-sm" />
        </div>
      ) : !tree || tree.length === 0 ? (
        <div className="mlm-empty-state">
          <Users size={40} className="mlm-empty-icon" />
          <p>
            {t.referrals?.mlm?.tree?.empty ||
              'No team members yet. Share your referral link to start building your network!'}
          </p>
        </div>
      ) : (
        <div className="mlm-tree-container">
          {tree.map((node) => (
            <TreeNode key={node.userId} node={node} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MLMTreeView;