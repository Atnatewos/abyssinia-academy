/**
 * @fileoverview Admin MLM Tree Inspector — Landing Page
 *
 * Route: /admin/referrals/mlm/tree
 *
 * Entry point for the tree inspector. Provides a user search box;
 * selecting a result navigates to /admin/referrals/mlm/tree/[userId]
 * where the nested downline is rendered.
 *
 * Path: apps/web/pages/admin/referrals/mlm/tree/index.jsx
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Network, Search, User, Loader } from 'lucide-react';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../../context/LanguageContext';
import { getItem } from '../../../../../lib/storage';

const AdminMlmTreeLandingPage = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [adminUser, setAdminUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
   * Searches users by name or phone for tree inspection.
   */
  const handleSearch = useCallback(async () => {
    const term = searchQuery.trim();
    if (!term) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = getItem('admin_token');
      const response = await fetch(
        `/api/admin/users?search=${encodeURIComponent(term)}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const payload = await response.json();
      if (payload.success) {
        setSearchResults(payload.data?.users || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

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
      subtitle="Search a user to inspect their downline network"
    >
      <div className="admin-page">
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
            className="admin-btn primary"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Loader className="animate-spin" size={16} /> : <Search size={16} />}
            Search
          </button>
        </div>

        {searchResults.length > 0 ? (
          <div className="admin-search-results">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                className="admin-search-result-item"
                onClick={() => router.push(`/admin/referrals/mlm/tree/${result.id}`)}
              >
                <User size={16} />
                <span>{result.fullName || result.full_name}</span>
                <span className="admin-cell-muted">{result.phone}</span>
              </button>
            ))}
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

export default AdminMlmTreeLandingPage;