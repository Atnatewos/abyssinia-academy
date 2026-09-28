/**
 * @fileoverview Admin MLM Tree Inspector
 *
 * Route: /admin/referrals/mlm/tree/[userId]
 *
 * Allows admin to view any user's complete downline referral tree.
 * Includes a user search bar and expandable tree visualization.
 *
 * Consumes: /api/admin/referrals/mlm/tree/[userId]
 *
 * Path: apps/web/pages/admin/referrals/mlm/tree/[userId].jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Network,
  Search,
  ChevronRight,
  ChevronDown,
  User,
  Users,
  ArrowLeft,
  Loader,
  AlertTriangle,
} from 'lucide-react';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../../context/LanguageContext';
import { getItem } from '../../../../../lib/storage';

const LEVEL_COLORS = {
  1: 'var(--color-accent, #f59e0b)',
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
 * Recursive tree node for admin inspection.
 */
const AdminTreeNode = ({ node, depth }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const levelColor = LEVEL_COLORS[depth] || LEVEL_COLORS[4];

  return (
    <div className="admin-tree-node" style={{ paddingLeft: depth > 1 ? '20px' : '0' }}>
      <div className="admin-tree-node-row">
        <button
          type="button"
          className={`admin-tree-toggle ${hasChildren ? '' : 'invisible'}`}
          onClick={() => setExpanded(!expanded)}
          disabled={!hasChildren}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="admin-tree-avatar" style={{ backgroundColor: `${levelColor}20`, color: levelColor }}>
          {hasChildren ? <Users size={16} /> : <User size={16} />}
        </div>

        <div className="admin-tree-info">
          <span className="admin-tree-name">{node.fullName || 'Unknown'}</span>
          <span className="admin-tree-meta">
            {node.phone || ''} · {formatDate(node.joinedAt)}
          </span>
        </div>

        <span className="admin-tree-level" style={{ color: levelColor, backgroundColor: `${levelColor}15` }}>
          L{depth}
        </span>

        {node.earningsFromUser > 0 && (
          <span className="admin-tree-earnings">{node.earningsFromUser} ETB</span>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="admin-tree-children">
          {node.children.map((child) => (
            <AdminTreeNode key={child.userId} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminMlmTreePage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { t } = useLanguage();

  /* ── Auth state ── */
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  /* ── Tree state ── */
  const [tree, setTree] = useState([]);
  const [totalDescendants, setTotalDescendants] = useState(0);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ── Search state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  /*
   * Check authentication on mount
   */
  useEffect(() => {
    const token = getItem('admin_token');
    const user = getItem('admin_user');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (user) {
      setAdminUser(typeof user === 'string' ? JSON.parse(user) : user);
    }
    setIsAuthLoading(false);
  }, [router]);

  /**
   * Fetches the referral tree for a specific user.
   */
  const fetchTree = useCallback(async (targetUserId) => {
    if (!targetUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getItem('admin_token');
      const response = await fetch(`/api/admin/referrals/mlm/tree/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setTree(data.data?.tree || []);
        setTotalDescendants(data.data?.totalDescendants || 0);
        setUser(data.data?.user || null);
      } else {
        setError(data.message || 'Failed to load tree');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Searches for users by name or phone.
   */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = getItem('admin_token');
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery.trim())}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data?.users || []);
      }
    } catch {
      /* Silent fail */
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!isAuthLoading && userId) {
      fetchTree(userId);
    }
  }, [isAuthLoading, userId, fetchTree]);

  /* ── Auth guard ── */
  if (isAuthLoading || !adminUser) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <Loader className="animate-spin" size={24} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t.referrals?.mlm?.tree?.title || 'Referral Tree Inspector'}
      subtitle="View any user's downline referral network"
    >
      <div className="admin-page">
        {/* Page Header */}
        <div className="admin-page-header">
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* User Search */}
        <div className="admin-tree-search">
          <div className="admin-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search user by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="admin-search-input"
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Loader className="animate-spin" size={16} /> : <Search size={16} />}
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="admin-search-results">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                className="admin-search-result-item"
                onClick={() => {
                  router.push(`/admin/referrals/mlm/tree/${result.id}`);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
              >
                <User size={16} />
                <span>{result.fullName}</span>
                <span className="admin-cell-muted">{result.phone}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tree Content */}
        {isLoading ? (
          <div className="admin-loading">
            <Loader className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div className="admin-error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : userId ? (
          <div className="admin-tree-container">
            {/* User Info Header */}
            {user && (
              <div className="admin-tree-user-header">
                <div className="admin-tree-user-avatar">
                  <User size={24} />
                </div>
                <div className="admin-tree-user-info">
                  <span className="admin-tree-user-name">{user.fullName}</span>
                  <span className="admin-tree-user-meta">
                    {user.phone} · {totalDescendants} team members
                  </span>
                </div>
              </div>
            )}

            {/* Tree */}
            {tree.length === 0 ? (
              <div className="admin-empty-state">
                <Network size={40} className="admin-empty-icon" />
                <p>No downline members for this user.</p>
              </div>
            ) : (
              <div className="admin-tree-list">
                {tree.map((node) => (
                  <AdminTreeNode key={node.userId} node={node} depth={1} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="admin-empty-state">
            <Network size={40} className="admin-empty-icon" />
            <p>Search for a user above to view their referral tree.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMlmTreePage;