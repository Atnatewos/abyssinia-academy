/**
 * @fileoverview Admin Discussions Page
 *
 * Discussion video management verified against the real schema:
 *   discussion_videos: id, youtube_id, title, duration, thumbnail,
 *                      sort_order, is_active, created_at
 *
 * There is no description, view_count, status, or published_at column.
 * Status is derived from is_active. Meta shows duration + sort order.
 *
 * Path: apps/web/pages/admin/discussions/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Edit, Trash2, Eye, Plus, MessageSquare, Clock } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * Extract an 11-character YouTube video ID from various formats.
 * @param {string} raw - Raw youtube_id value
 * @returns {string} Clean ID or original string
 */
const extractYouTubeId = (raw) => {
  if (!raw) return '';
  const match = raw.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  return raw;
};

const AdminDiscussionsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchDiscussions = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/admin/discussions?${params.toString()}`);
      if (response.success) {
        setDiscussions(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load discussions');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load discussions');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, router, toast]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleDelete = async (discussionId) => {
    try {
      const response = await apiClient.delete(`/admin/discussions/${discussionId}`);
      if (response.success) {
        toast.success(response.message || 'Discussion deleted successfully');
        setDeleteConfirm(null);
        fetchDiscussions();
      } else {
        toast.error(response.message || 'Failed to delete discussion');
      }
    } catch (err) {
      toast.error('Failed to delete discussion');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderShimmerRow = (index) => (
    <div key={`shimmer-${index}`} className="admin-table-row">
      <div className="admin-table-info">
        <div className="admin-table-info-top">
          <div className="admin-table-avatar discussion shimmer" />
          <div className="admin-table-name-block">
            <span className="admin-table-name shimmer" style={{ width: '60%', height: '0.875rem' }} />
            <span className="admin-table-sub shimmer" style={{ width: '45%', height: '0.75rem' }} />
          </div>
        </div>
        <p className="admin-table-meta">
          <span className="shimmer" style={{ display: 'inline-block', width: '14rem', height: '0.75rem' }} />
        </p>
      </div>
      <div className="admin-table-actions-wrapper">
        <div className="admin-table-meta-col">
          <span className="status-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
        </div>
        <div className="admin-table-action-btns">
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Discussions Management" />
      <AdminLayout
        title={t.admin?.discussions?.title || 'Discussions'}
        subtitle="Manage live Q&A and community discussion videos"
      >
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search discussions..."
            />
          </div>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button
            className="admin-toolbar-btn primary"
            onClick={() => router.push('/admin/discussions/new')}
          >
            <Plus size={16} />
            <span>Add Discussion</span>
          </button>
        </div>

        {loading ? (
          <div className="admin-table-wrapper">
            {Array.from({ length: 5 }).map((_, i) => renderShimmerRow(i))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">
              {searchTerm || statusFilter !== 'all'
                ? 'No discussions match your filters.'
                : 'No discussions created yet.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {discussions.map((discussion) => {
              const cleanId = extractYouTubeId(discussion.youtube_id);
              return (
                <div key={discussion.id} className="admin-table-row">
                  <div className="admin-table-info">
                    <div className="admin-table-info-top">
                      <div className="admin-table-avatar discussion">
                        <MessageSquare size={16} />
                      </div>
                      <div className="admin-table-name-block">
                        <span className="admin-table-name">{discussion.title || 'Untitled'}</span>
                        <span className="admin-table-sub">
                          {cleanId ? `YouTube: ${cleanId}` : 'No source'}
                        </span>
                      </div>
                    </div>
                    <p className="admin-table-meta">
                      <Clock size={12} /> {discussion.duration || '—'} ·
                      Sort order: {discussion.sort_order ?? '—'} ·
                      Created {formatDate(discussion.created_at)}
                    </p>
                  </div>

                  <div className="admin-table-actions-wrapper">
                    <div className="admin-table-meta-col">
                      <span className={`status-badge ${discussion.is_active ? 'approved' : 'pending'}`}>
                        {discussion.is_active ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="admin-table-action-btns">
                      {cleanId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${cleanId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-action-btn view"
                          title="Preview on YouTube"
                        >
                          <Eye size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => router.push(`/admin/discussions/${discussion.id}/edit`)}
                        className="admin-action-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(discussion.id)}
                        className="admin-action-btn reject"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Discussion?</h3>
              <p>This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminDiscussionsPage;